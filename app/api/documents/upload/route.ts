import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/src/middlewares/auth';
import { uploadToCloudinary } from '@/src/storage/cloudinary';
import { Document } from '@/src/models/Document';
import { OCREngine } from '@/src/ocr/engine';
import { DocumentParserPipeline } from '@/src/ai/parser';
import { DocumentValidator } from '@/src/validators/documentValidator';

// IMPORTANT: Max duration for Vercel Free is 10s. For large docs, this might timeout.
// A premium setup would use a job queue, but this adheres to the 100% free constraint.
export const maxDuration = 10; // Vercel setting

async function uploadHandler(req: AuthenticatedRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const documentType = formData.get('documentType') as string | undefined;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Upload to Cloudinary
    console.log(`[Upload] Uploading ${file.name} to Cloudinary...`);
    const { url, publicId } = await uploadToCloudinary(buffer, file.name);

    // 2. Create initial DB Record
    const docRecord = await Document.create({
      uploaderId: req.user!._id,
      title: file.name,
      originalFilename: file.name,
      url,
      publicId,
      documentType: documentType || 'Unknown',
      status: 'Processing',
    });

    console.log(`[Upload] Document record created: ${docRecord._id}`);

    // Since we are on serverless, we must process synchronously or the function dies.
    // In a real heavy environment, we would return here and trigger a webhook/queue.
    
    // 3. Extract Text (OCR)
    console.log(`[OCR] Starting text extraction for ${docRecord._id}...`);
    let extractedText = '';
    try {
      extractedText = await OCREngine.processDocument(buffer, file.type);
    } catch (ocrError: any) {
      console.error(`[OCR] Error:`, ocrError);
      docRecord.status = 'Failed';
      docRecord.validationErrors = { ocr: ocrError.message };
      await docRecord.save();
      return NextResponse.json({ error: 'OCR processing failed', document: docRecord }, { status: 500 });
    }

    // 4. Parse with AI Pipeline
    console.log(`[AI] Starting parsing for ${docRecord._id}...`);
    try {
      const parsedData = await DocumentParserPipeline.parse(extractedText, documentType);
      
      docRecord.extractedData = parsedData.extractedData;
      docRecord.documentType = parsedData.documentType || docRecord.documentType;
      docRecord.confidenceScore = parsedData.confidenceScore;
      
      const validationErrors = DocumentValidator.validate(parsedData.extractedData, docRecord.documentType) || {};
      
      // Basic Confidence Validation Rule
      if (parsedData.confidenceScore < 70) {
        validationErrors['confidence'] = 'Confidence score is below 70, manual review required.';
      }

      if (Object.keys(validationErrors).length > 0) {
        docRecord.status = 'Validation_Pending';
        docRecord.validationErrors = validationErrors;
      } else {
        docRecord.status = 'Completed';
      }

      await docRecord.save();
      console.log(`[Success] Document ${docRecord._id} processed. Status: ${docRecord.status}`);
      
      return NextResponse.json({ message: 'Upload and processing complete', document: docRecord }, { status: 200 });

    } catch (aiError: any) {
      console.error(`[AI] Error:`, aiError);
      docRecord.status = 'Failed';
      docRecord.validationErrors = { ai: aiError.message };
      await docRecord.save();
      return NextResponse.json({ error: 'AI processing failed', document: docRecord }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Upload route error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return withAuth(req, uploadHandler);
}

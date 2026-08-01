import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// We need to load pdfjs worker. In Node, we can just use a generic or empty worker
// or set the workerSrc to a dummy since we aren't rendering to canvas directly if we just extract text.
// However, rendering PDF to image in pure Node.js with pdf.js requires node-canvas.
// Since the prompt requires "tesseract.js" and "pdf.js", and we are running in Next.js Serverless (Vercel),
// installing node-canvas on Vercel is notoriously difficult and heavy.
// A common workaround is to extract native text using pdf.js, and only use Tesseract on actual image uploads.
// If it's a scanned PDF, pure pdf.js will return empty text, and we'd ideally need to render it to an image first.
// We will implement a robust approach: Try pdf.js text extraction first.

export class OCREngine {
  /**
   * Processes an image buffer (PNG, JPEG) using Tesseract.js
   */
  static async processImage(imageBuffer: Buffer): Promise<string> {
    const worker = await createWorker('eng');
    try {
      const { data: { text } } = await worker.recognize(imageBuffer);
      return text;
    } finally {
      await worker.terminate();
    }
  }

  /**
   * Processes a PDF buffer using pdf.js for native text.
   * Note: For scanned PDFs in a serverless environment, rendering pages to images
   * without node-canvas is complex. We will rely on pdf.js for text extraction.
   */
  static async processPdf(pdfBuffer: Buffer): Promise<string> {
    const data = new Uint8Array(pdfBuffer);
    const loadingTask = pdfjsLib.getDocument({ data });
    
    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;
    let fullText = '';

    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += `--- Page ${i} ---\n${pageText}\n`;
    }

    return fullText;
  }

  /**
   * Main entry point to process a file buffer based on mimetype.
   */
  static async processDocument(fileBuffer: Buffer, mimeType: string): Promise<string> {
    if (mimeType === 'application/pdf') {
      const text = await this.processPdf(fileBuffer);
      // If the PDF is just scanned images, the text might be very short or empty.
      // In a full implementation with node-canvas, we would fallback to image rendering -> tesseract here.
      if (text.trim().length < 50) {
        console.warn('PDF text extraction yielded very little text. It might be a scanned PDF without a text layer.');
      }
      return text;
    } else if (mimeType.startsWith('image/')) {
      return await this.processImage(fileBuffer);
    } else {
      throw new Error(`Unsupported mime type for OCR: ${mimeType}`);
    }
  }
}

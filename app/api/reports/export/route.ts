import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/src/middlewares/auth';
import { Document } from '@/src/models/Document';
import { AuditLog } from '@/src/models/AuditLog';

async function exportHandler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    
    let query: any = {};
    if (req.user!.role === 'User') {
      query.uploaderId = req.user!._id;
    }
    if (status) query.status = status;

    const documents = await Document.find(query).lean();

    if (documents.length === 0) {
      return NextResponse.json({ error: 'No documents found to export' }, { status: 404 });
    }

    // Generate CSV
    const headers = ['Document ID', 'Title', 'Type', 'Status', 'Confidence Score', 'Created At'];
    const rows = documents.map((doc: any) => [
      doc._id.toString(),
      `"${doc.title.replace(/"/g, '""')}"`,
      doc.documentType || 'Unknown',
      doc.status,
      doc.confidenceScore || 0,
      new Date(doc.createdAt).toISOString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    await AuditLog.create({
      userId: req.user!._id,
      action: 'Export_Reports',
      resource: 'Document',
      ipAddress: req.headers.get('x-forwarded-for') || 'Unknown',
    });

    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="documents_export_${Date.now()}.csv"`,
      },
    });

    return response;

  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Only Admin or Analyst can export global reports, User exports own.
  return withAuth(req, exportHandler);
}

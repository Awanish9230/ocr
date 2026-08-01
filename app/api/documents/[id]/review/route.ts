import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/src/middlewares/auth';
import { Document } from '@/src/models/Document';
import { AuditLog } from '@/src/models/AuditLog';

async function reviewDocumentHandler(req: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // Only Admin or Analyst can review
    if (req.user!.role === 'User') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { action, extractedData, remarks } = body; // action: 'approve' | 'reject'

    const doc = await Document.findById(id);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (action === 'approve') {
      doc.status = 'Completed';
      if (extractedData) {
        doc.extractedData = extractedData;
      }
      doc.validationErrors = null; // Clear errors upon manual approval
    } else if (action === 'reject') {
      doc.status = 'Failed';
      doc.validationErrors = { manual_review: remarks || 'Rejected during manual review' };
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await doc.save();

    await AuditLog.create({
      userId: req.user!._id,
      action: `Review_${action.toUpperCase()}`,
      resource: 'Document',
      resourceId: doc._id,
      details: { remarks },
      ipAddress: req.headers.get('x-forwarded-for') || 'Unknown',
    });

    return NextResponse.json({ message: `Document ${action}d successfully`, document: doc }, { status: 200 });

  } catch (error: any) {
    console.error('Review Document error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return withAuth(req, async (authReq) => reviewDocumentHandler(authReq, { params: resolvedParams }), ['Admin', 'Analyst']);
}

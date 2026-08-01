import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/src/middlewares/auth';
import { Document } from '@/src/models/Document';

async function listDocumentsHandler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    
    let query: any = {};
    
    // Non-admins only see their own docs, unless they are Analysts? 
    // Wait, Analyst role is specifically for review. Let's allow Analyst to see all.
    if (req.user!.role === 'User') {
      query.uploaderId = req.user!._id;
    }

    if (status) query.status = status;
    if (type) query.documentType = type;

    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .populate('uploaderId', 'name email')
      .lean();

    return NextResponse.json({ documents }, { status: 200 });

  } catch (error: any) {
    console.error('List Documents error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return withAuth(req, listDocumentsHandler);
}

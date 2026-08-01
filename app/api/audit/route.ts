import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/src/middlewares/auth';
import { AuditLog } from '@/src/models/AuditLog';

async function auditLogsHandler(req: AuthenticatedRequest) {
  try {
    // Only Admin can view Audit Logs
    if (req.user!.role !== 'Admin') {
      return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email role')
      .lean();
      
    const total = await AuditLog.countDocuments({});

    return NextResponse.json({
      logs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Audit API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return withAuth(req, auditLogsHandler, ['Admin']);
}

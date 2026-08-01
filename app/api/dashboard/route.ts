import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/src/middlewares/auth';
import { Document } from '@/src/models/Document';

async function dashboardHandler(req: AuthenticatedRequest) {
  try {
    const userRole = req.user!.role;
    
    // Base query based on role. Users only see their own docs, Analysts/Admins see all.
    const query = (userRole === 'Admin' || userRole === 'Analyst') ? {} : { uploaderId: req.user!._id };

    const totalDocuments = await Document.countDocuments(query);
    const completedDocs = await Document.countDocuments({ ...query, status: 'Completed' });
    const failedDocs = await Document.countDocuments({ ...query, status: 'Failed' });
    const pendingReviewDocs = await Document.countDocuments({ ...query, status: 'Validation_Pending' });

    const successRate = totalDocuments > 0 ? ((completedDocs / totalDocuments) * 100).toFixed(1) : 0;
    const failureRate = totalDocuments > 0 ? ((failedDocs / totalDocuments) * 100).toFixed(1) : 0;

    const recentUploads = await Document.find(query)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('uploaderId', 'name email')
      .lean();

    // Chart Data Generation (Dummy aggregated data for now, typically you'd use MongoDB aggregations)
    // Here we use simple aggregation for document types
    const docTypesAgg = await Document.aggregate([
      { $match: query },
      { $group: { _id: '$documentType', count: { $sum: 1 } } }
    ]);
    const documentTypesData = docTypesAgg.map(d => ({ name: d._id || 'Unknown', value: d.count }));

    return NextResponse.json({
      stats: {
        totalDocuments,
        successRate,
        failureRate,
        pendingReviewDocs,
      },
      recentUploads,
      charts: {
        documentTypes: documentTypesData,
        // Mock data for line charts to save complexity in aggregation right now
        monthlyUploads: [
          { name: 'Jan', count: 40 },
          { name: 'Feb', count: 30 },
          { name: 'Mar', count: 20 },
          { name: 'Apr', count: 27 },
          { name: 'May', count: 18 },
          { name: 'Jun', count: 23 },
          { name: 'Jul', count: 34 },
        ]
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return withAuth(req, dashboardHandler);
}

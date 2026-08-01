import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, JwtPayload } from '@/src/utils/jwt';
import { connectToDatabase } from '@/src/database/connection';
import { User, IUser } from '@/src/models/User';

export interface AuthenticatedRequest extends NextRequest {
  user?: IUser;
  jwtPayload?: JwtPayload;
}

export async function withAuth(
  req: NextRequest,
  handler: (req: AuthenticatedRequest, res?: any) => Promise<NextResponse>,
  allowedRoles?: string[]
): Promise<NextResponse> {
  try {
    const token = req.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    let payload: JwtPayload;
    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
    }

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    await connectToDatabase();
    const user = await User.findById(payload.userId).lean();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
    }

    // Attach user and payload to a cloned/modified request or pass explicitly if needed.
    // In Next.js App router, you can't easily mutate NextRequest directly in a type-safe way for the handler unless you cast.
    const authReq = req as AuthenticatedRequest;
    authReq.user = user as IUser;
    authReq.jwtPayload = payload;

    return await handler(authReq);
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/src/database/connection';
import { RefreshToken } from '@/src/models/RefreshToken';
import { User } from '@/src/models/User';
import { generateAccessToken, verifyRefreshToken } from '@/src/utils/jwt';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('refreshToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No refresh token provided' }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
    }

    await connectToDatabase();

    const storedToken = await RefreshToken.findOne({ token, isRevoked: false });
    if (!storedToken) {
      return NextResponse.json({ error: 'Refresh token revoked or not found' }, { status: 401 });
    }

    const user = await User.findById(payload.userId).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newAccessToken = generateAccessToken(user._id, user.role);

    const response = NextResponse.json({ message: 'Token refreshed' }, { status: 200 });

    response.cookies.set({
      name: 'accessToken',
      value: newAccessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

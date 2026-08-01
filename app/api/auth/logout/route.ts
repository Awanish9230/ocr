import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/src/database/connection';
import { RefreshToken } from '@/src/models/RefreshToken';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (refreshToken) {
      await connectToDatabase();
      // Revoke the token
      await RefreshToken.updateOne({ token: refreshToken }, { isRevoked: true });
    }

    const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });

    // Clear cookies
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

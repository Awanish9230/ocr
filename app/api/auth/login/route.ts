import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/src/database/connection';
import { User } from '@/src/models/User';
import { RefreshToken } from '@/src/models/RefreshToken';
import { AuditLog } from '@/src/models/AuditLog';
import { generateAccessToken, generateRefreshToken } from '@/src/utils/jwt';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedData = loginSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { email, password } = parsedData.data;

    await connectToDatabase();

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      // Log failed attempt optionally
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Calculate expiration date for refresh token DB entry (7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt,
    });

    await AuditLog.create({
      userId: user._id,
      action: 'Login',
      resource: 'User',
      resourceId: user._id,
      ipAddress: req.headers.get('x-forwarded-for') || 'Unknown',
    });

    const response = NextResponse.json(
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // Set HTTP-Only cookies
    response.cookies.set({
      name: 'accessToken',
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    response.cookies.set({
      name: 'refreshToken',
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

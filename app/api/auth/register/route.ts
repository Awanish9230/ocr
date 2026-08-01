import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/src/database/connection';
import { User } from '@/src/models/User';
import { AuditLog } from '@/src/models/AuditLog';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['Admin', 'Analyst', 'User']).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedData = registerSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsedData.data;

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email is already registered' }, { status: 409 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'User',
    });

    await AuditLog.create({
      userId: newUser._id,
      action: 'Register',
      resource: 'User',
      resourceId: newUser._id,
      ipAddress: req.headers.get('x-forwarded-for') || 'Unknown',
    });

    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// app/api/auth/update-username/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const newUsername = (await req.json()).username?.trim().toLowerCase();
  if (!newUsername) {
    return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
  }

  await connectToDatabase();
  // ensure not taken
  const taken = await User.exists({ username: newUsername });
  if (taken) {
    return NextResponse.json({ error: 'Username taken' }, { status: 409 });
  }

  // update current OAuth user by email
  const user = await User.findOneAndUpdate(
    { email: session.user.email.toLowerCase() },
    { username: newUsername },
    { new: true }
  );

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, username: newUsername });
}

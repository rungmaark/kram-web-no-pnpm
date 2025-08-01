// app/api/auth/username/update/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = await req.json();
  if (!username || typeof username !== "string") {
    return NextResponse.json({ error: "Invalid username" }, { status: 400 });
  }

  await connectToDatabase();

  // ตรวจสอบว่า username ซ้ำหรือไม่ (exclude ตัวเอง)
  const existing = await User.findOne({
    username,
    _id: { $ne: session.user.id },
  });

  if (existing) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  // อัปเดต username
  const updated = await User.findByIdAndUpdate(
    session.user.id,
    { username },
    { new: true }
  );

  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  console.log('updated username session : ', session.user.username)

  return NextResponse.json({ success: true, username: updated.username });
}
// app/api/auth/user-by-id/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: NextRequest) {
  try {
    // ✅ ดึงข้อมูล session จาก cookies โดยใช้ getServerSession
    const session = await getServerSession(authOptions);

    // ✅ เช็คว่า session มีข้อมูลผู้ใช้หรือไม่
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { user: null, error: "No session found" }
      );
    }

    const userId = session.user.id;

    // ✅ เชื่อมต่อกับฐานข้อมูล
    await connectToDatabase();

    // ✅ ค้นหาผู้ใช้จากฐานข้อมูล
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ user: null });
    }

    // ✅ ส่งข้อมูลผู้ใช้กลับ
    return NextResponse.json({
      user: {
        userId: user._id,
        username: user.username,
        displayName: user.displayName,
        interests: user.interests,
        gender: user.gender,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { user: null, error: "Server error" },
      { status: 500 }
    );
  }
}

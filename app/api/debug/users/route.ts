// app/api/debug/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    
    const users = await User.find({})
      .select("_id username displayName")
      .lean();

    return NextResponse.json({
      success: true,
      count: users.length,
      users: users.map(u => ({
        _id: u._id.toString(),
        username: u.username,
        displayName: u.displayName
      }))
    });

  } catch (error: any) {
    return NextResponse.json({
      error: "Database error",
      details: error?.message || "Unknown error"
    }, { status: 500 });
  }
}
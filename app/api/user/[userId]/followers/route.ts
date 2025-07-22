// app/api/user/[userId]/followers/route.ts
import { NextRequest, NextResponse } from "next/server";
import Follow from "@/models/Follow";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;          // ⬅️ ต้อง await

  const url   = new URL(req.url);
  const page  = parseInt(url.searchParams.get("page")  || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const skip  = (page - 1) * limit;

  const followers = await Follow.find({ following: userId })
    .sort({ createdAt: -1, _id: -1 })
    .skip(skip)
    .limit(limit)
    .populate("follower", "username displayName profileImage gender")
    .lean();

  return NextResponse.json(followers.map(f => f.follower));
}

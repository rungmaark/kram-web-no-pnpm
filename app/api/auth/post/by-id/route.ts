// app/api/auth/post/by-id/route.ts

// 👇 เพิ่มไว้บนสุด ปิด cache ISR/edge
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Post from "@/models/Post";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const postId = req.nextUrl.searchParams.get("id");
    if (!postId) {
      return NextResponse.json({ error: "missing id" }, { status: 400 });
    }

    const post = await Post.findById(postId)
      .populate("author")
      .populate("commentsCount") // ✅ เพิ่ม populate count
      .lean({ virtuals: true }); // ✅ ให้ virtual ติดมาด้วย
    if (!post) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (err) {
    console.error("GET /api/auth/post/by-id:", err);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}

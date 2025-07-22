// app/api/auth/post/[postId]/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";
import Post from "@/models/Post";
import { connectToDatabase } from "@/lib/mongodb";
export const dynamic = "force-dynamic";

/* ---------- POST : กด Like ---------- */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> } // ← รับเป็น Promise
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await params; // ← ต้อง await
  const userId = new mongoose.Types.ObjectId(session.user.id);
  const _id = new mongoose.Types.ObjectId(postId);

  const post = await Post.findByIdAndUpdate(
    _id,
    { $addToSet: { likes: userId } },
    { new: true, projection: { likes: 1 } }
  );
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ likesCount: post.likes.length, liked: true });
}

/* ---------- DELETE : ยกเลิก Like ---------- */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await params;
  const userId = new mongoose.Types.ObjectId(session.user.id);
  const _id = new mongoose.Types.ObjectId(postId);

  const post = await Post.findByIdAndUpdate(
    _id,
    { $pull: { likes: userId } },
    { new: true, projection: { likes: 1 } }
  );
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ likesCount: post.likes.length, liked: false });
}

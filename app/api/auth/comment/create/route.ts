import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import Comment from "@/models/Comment";
import mongoose from "mongoose";

type PopulatedUser = {
  _id: mongoose.Types.ObjectId;
  username: string;
  displayName: string;
  profileImage?: string;
  gender?: string;
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId, text } = await req.json();
  if (!postId || !text?.trim())
    return NextResponse.json(
      { error: "postId & text required" },
      { status: 400 }
    );

  await connectToDatabase();

  /* 1️⃣ สร้างคอมเมนต์ */
  const newComment = await Comment.create({
    postId,
    userId: session.user.id,
    text: text.trim(),
  });

  /* 2️⃣ query อีกครั้งแบบ populate + lean */
  const comment = await Comment.findById(newComment._id)
    .populate<{ userId: PopulatedUser }>(
      "userId",
      "username displayName profileImage gender"
    )
    .lean<{
      _id: mongoose.Types.ObjectId;
      text: string;
      createdAt: Date;
      userId: PopulatedUser;
    }>()
    .exec();

  if (!comment)
    return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({
    comment: {
      _id: comment._id.toString(),
      text: comment.text,
      createdAt: comment.createdAt,
      author: {
        username: comment.userId.username,
        displayName: comment.userId.displayName,
        profileImage: comment.userId.profileImage,
        gender: comment.userId.gender,
      },
    },
  });
}

// app/api/auth/conversation/join-post/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import Post, { IPost } from "@/models/Post";
import User from "@/models/User";
import { IConversation } from "@/models/Conversation";
import mongoose, { Types } from "mongoose";

export async function POST(req: Request) {
  const { postId } = await req.json();
  if (!postId) {
    return NextResponse.json({ error: "Missing postId" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;
  if (!currentUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const post = await Post.findById(postId);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const ownerUser = await User.findById(post.userId);
  const ownerDisplayName = ownerUser?.displayName || "Unknown";

  const existingConvo = await Conversation.findOne({ postId });

  let convo: IConversation;
  if (!existingConvo) {
    convo = await Conversation.create({
      isGroup: true,
      name: `${ownerDisplayName} ${post.game}`,
      postId: post._id,
      participants: [new Types.ObjectId(post.userId)],
    });
  } else {
    convo = existingConvo as IConversation;
  }

  const participantIds = convo.participants.map((id) => id.toString());
  const alreadyIn = participantIds.includes(currentUserId);

  if (!alreadyIn) {
    convo.participants.push(new Types.ObjectId(currentUserId));
    await convo.save();
  }

  return NextResponse.json({ _id: (convo._id as Types.ObjectId).toString() });
}

// app/api/auth/conversation/get-or-create/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import Conversation from "@/models/Conversation";

export async function POST(req: Request) {
  const { targetUserId } = await req.json();

  const session = await getServerSession(authOptions);
  const currentUserId = session?.user.id;

  if (!currentUserId || !targetUserId) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (currentUserId === targetUserId) {
    return NextResponse.json({ error: "Cannot chat with yourself" }, { status: 400 });
  }

  await connectToDatabase();

  let convo = await Conversation.findOne({
    participants: { $all: [currentUserId, targetUserId], $size: 2 },
    isGroup: false,
  });

  if (!convo) {
    convo = await Conversation.create({
      participants: [currentUserId, targetUserId],
      isGroup: false,
    });
  }

  return NextResponse.json({
    _id: convo._id,
    isGroup: convo.isGroup,
    participants: convo.participants,
  });
}

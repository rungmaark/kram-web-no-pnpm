// app/api/auth/conversation/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import Conversation from "@/models/Conversation";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUserId = session.user.id;

  await connectToDatabase();

  const convos = await Conversation.find({
    participants: currentUserId,
  })
    .populate("participants", "displayName gender")
    .sort({ updatedAt: -1 })
    .lean();

  return NextResponse.json(convos);
}

// app/api/auth/conversation/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import Conversation, { IConversation } from "@/models/Conversation";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const urlParts = req.nextUrl.pathname.split("/");
    const conversationId = urlParts[urlParts.length - 1];

    await connectToDatabase();

    const convo = await Conversation.findById(conversationId)
      .populate("participants", "displayName gender")
      .populate({ path: "postId", select: "game", model: "Post" })
      .lean<IConversation & { post?: { game: string } }>();

    if (!convo) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      isGroup: convo.isGroup ?? false,
      participants: convo.participants ?? [],
      post: convo.postId ?? null,
      name: convo.name ?? null,
    });
  } catch (error) {
    console.error("❌ Internal Server Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

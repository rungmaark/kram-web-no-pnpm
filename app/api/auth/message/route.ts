// app/api/auth/message/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/models/Message";
import { getIO } from "@/lib/socketServer";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json(
      { error: "Missing conversationId" },
      { status: 400 }
    );
  }

  await connectToDatabase();
  const messages = await Message.find({ conversationId })
    .populate("sender", "displayName gender")
    .sort({ createdAt: 1 })
    .lean();

  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  // 1) อ่าน payload
  const { conversationId, text } = await req.json();
  if (!conversationId || !text) {
    return NextResponse.json(
      { error: "Missing conversationId or text" },
      { status: 400 }
    );
  }

  // 2) ตรวจ session
  const session = await getServerSession(authOptions);
  const senderId = session?.user?.id;
  if (!senderId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3) เชื่อม DB และสร้าง message
  await connectToDatabase();
  let savedMessage = await Message.create({
    conversationId,
    text,
    sender: senderId,
  });

  await savedMessage.populate("sender", "displayName profileImage");
  const plain = savedMessage.toObject();
  plain.conversationId = plain.conversationId.toString(); // ★ ให้เป็น string

  // forward ให้ทุกคนในห้องเดียวกัน
  const io = getIO();
  io?.to(plain.conversationId).emit("new_message", plain);
  return NextResponse.json(plain);
}

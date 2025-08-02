// app/api/feedback/route.ts

import { NextRequest, NextResponse } from "next/server";
import { Feedback } from "@/models/Feedback";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const { emoji, feedback } = body;

    const newFeedback = await Feedback.create({
      emoji,
      feedback,
      userId: session?.user?.id ?? null,
    });

    return NextResponse.json({ success: true, feedback: newFeedback });
  } catch (err) {
    console.error("Feedback error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

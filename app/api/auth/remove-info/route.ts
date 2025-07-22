import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, type } = body;

    console.log("body", type);

    if (!userId || !["instagram", "facebook", 'twitter', 'linkedin'].includes(type)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    await connectToDatabase();

    const updateField =
      type === "instagram" ? { instagram: "" } : type === "facebook" ? { facebook: "" } : type === "twitter" ? { twitter: "" } : type === 'linkedin' ? { linkedin: "" } : {};

    await User.findByIdAndUpdate(userId, { $set: updateField });

    return NextResponse.json({ message: `${type} removed` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

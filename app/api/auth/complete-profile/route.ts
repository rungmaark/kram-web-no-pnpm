// app/api/auth/complete-profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { username, password } = await req.json();
  const email = session.user.email.toLowerCase();

  await connectToDatabase();

  // ✏️ generate password hash
  const hashedPassword = await bcrypt.hash(password, 10);

  // 🔍 หา user ตาม email
  let user = await User.findOne({ email });
  if (!user) {
    // ➕ ถ้าไม่เจอ ให้สร้างขึ้นมาใหม่
    user = new User({
      email,
      displayName: session.user.displayName!,
      // เอาฟิลด์อื่น ๆ ที่จำเป็นจาก session มาใส่ได้ตาม schema
    });
  }

  // ✏️ อัปเดต username + password
  user.username = username.trim().toLowerCase();
  user.password = hashedPassword;

  // 💾 บันทึก (create หรือ update)
  const saved = await user.save();
  console.log("✅ สร้าง/อัปเดต user สำเร็จ:", saved);

  return NextResponse.json({ success: true });
}

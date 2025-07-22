// app/api/profile/raw/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { decrypt } from "@/lib/encrypt";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await UserModel.findById(session.user.id).select(
      "+rawProfileText interests"
    );
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ① ดึงข้อมูลที่เก็บมา
    const stored = user.rawProfileText ?? "";
    let rawText: string;
    // ② ตรวจสอบรูปแบบก่อน ว่าเป็น encrypted format (hex:hex) หรือไม่
    const isEncrypted = /^([0-9a-fA-F]+):([0-9a-fA-F]+)$/.test(stored);
    if (!isEncrypted) {
      // ถ้าไม่ใช่ encrypted ให้ใช้เป็น plaintext เลย
      rawText = stored;
    } else {
      // ถ้าใช่ ให้ decrypt จริงจัง (ถ้า decrypt error จะ throw ขึ้นไป)
      rawText = decrypt(stored);
    }

    // ดึง interests ก็ระบุ type ชัดๆ
    const interests = Array.isArray(user.interests)
      ? user.interests.map(
          (i: { interestName: string; category: string }) => i.interestName
        )
      : [];

    return NextResponse.json({ rawText, interests });
  } catch (err: any) {
    console.error("/api/profile/raw error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

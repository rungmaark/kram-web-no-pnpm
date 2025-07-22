// app/api/image-proxy/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");

  if (!key) {
    return new NextResponse("Missing key", { status: 400 });
  }

  const region = process.env.AWS_REGION!;
  const bucket = process.env.AWS_BUCKET_NAME!;
  const imageUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  return NextResponse.redirect(imageUrl); // ทำ proxy แบบ redirect
}
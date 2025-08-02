// app/api/posts/semantic-search/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Post, { IPost } from "@/models/Post";
import type { PostSemanticAnalysisResult } from "@/lib/ultraStrictSemanticAnalyzerPost";
import { analyzePostSemantic } from "@/lib/ultraStrictSemanticAnalyzerPost";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  // เช็คเงื่อนไขถ้า q ว่าง → return empty
  if (!q) return NextResponse.json({ posts: [] });

  await connectToDatabase();
  // ดึงโพสต์ทั้งหมด (lean() คืน any[] → cast ผ่าน unknown → เป็น IPost[])
  const raw = await Post.find().lean();
  const posts = raw as unknown as IPost[];
  // เรียก analyzePostSemantic ทีละโพสต์ พร้อมระบุ type ให้ analysis ไม่เป็น any
  const analyses: Array<{ post: IPost; analysis: PostSemanticAnalysisResult }> =
    await Promise.all(
      posts.map(async (p) => ({
        post: p,
        analysis: await analyzePostSemantic(q, p),
      }))
    );
  // กรองเอาเฉพาะที่ match หรือ similarity สูงกว่า threshold
  const matched = analyses
    .filter(
      ({ analysis }: { analysis: PostSemanticAnalysisResult }) =>
        analysis.textMatch.hasMatch ||
        analysis.embeddingSimilarity >=
          analysis.semanticProfile.semanticThreshold
    )
    // เรียงตาม embeddingSimilarity ลงมา
    .sort(
      (a, b) => b.analysis.embeddingSimilarity - a.analysis.embeddingSimilarity
    )
    .map((x) => x.post);

  return NextResponse.json({ posts: matched });
}

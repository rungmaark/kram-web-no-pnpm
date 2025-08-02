// lib/ultraStrictSemanticAnalyzerPost.ts

import { IPost } from "@/models/Post";
import {
  extractSemanticConcepts,
  validateSemanticMatch,
  calculateEmbeddingSimilarity,
  calculateAdvancedKeywordMatch,
  createEmbedding,
} from "@/lib/ultraStrictSemanticAnalyzer";
import type { UltraStrictSemanticMatch } from "@/lib/ultraStrictSemanticAnalyzer";

/**
 * ผลลัพธ์การวิเคราะห์เชิงความหมายของโพสต์
 */
export interface PostSemanticAnalysisResult {
  postId: string;
  /** รายละเอียดเชิงแนวคิดของคิวรี่ */
  semanticProfile: UltraStrictSemanticMatch;
  /** ผลการ Validate Semantic Match บนเนื้อหาโพสต์ */
  textMatch: {
    hasMatch: boolean;
    matchType: string;
    confidence: number;
    matchDetails: string[];
  };
  /** ค่าความคล้ายด้วย Embedding */
  embeddingSimilarity: number;
  /** ผลการจับคู่ด้วยคีย์เวิร์ดขั้นสูง */
  keywordMatch: {
    score: number;
    matchDetails: {
      primaryMatches: string[];
      expandedMatches: string[];
      contextMatches: string[];
    };
    hasExactMatch: boolean;
  };
}

/**
 * วิเคราะห์ความเกี่ยวข้องของ query กับเนื้อหาในโพสต์
 * @param query ข้อความที่ใช้ค้นหา
 * @param post ออบเจ็กต์โพสต์ (IPost)
 * @returns รายงานผลการวิเคราะห์เชิงความหมายและการจับคู่
 */
export async function analyzePostSemantic(
  query: string,
  post: IPost
): Promise<PostSemanticAnalysisResult> {
  // Stage 1: สกัดคอนเซ็ปต์หลัก
  const { primaryConcepts, expandedConcepts, semanticContexts } =
    await extractSemanticConcepts(query);

  // สร้าง embedding ของ query
  const queryEmbedding = await createEmbedding(query);

  // Semantic profile สำหรับเก็บข้อมูลคิวรี่
  const semanticProfile: UltraStrictSemanticMatch = {
    query,
    primaryConcepts,
    expandedConcepts,
    semanticThreshold: 0.4,
    queryEmbedding,
  };

  // เนื้อหาโพสต์ (text)
  const content = post.text || "";

  // Stage 2: Validate semantic match
  const textMatch = await validateSemanticMatch(
    query,
    primaryConcepts,
    expandedConcepts,
    semanticContexts,
    content
  );

  // Stage 3: Embedding similarity
  const embeddingSimilarity = await calculateEmbeddingSimilarity(
    queryEmbedding,
    content
  );

  // Stage 4: Keyword matching
  const { score, matchDetails, hasExactMatch } =
    calculateAdvancedKeywordMatch(
      primaryConcepts,
      expandedConcepts,
      semanticContexts,
      content
    );

  return {
    postId: post._id.toString(),
    semanticProfile,
    textMatch,
    embeddingSimilarity,
    keywordMatch: {
      score,
      matchDetails,
      hasExactMatch,
    },
  };
}

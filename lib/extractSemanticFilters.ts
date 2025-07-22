// lib/extractSemanticFilters.ts

import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/**
 * วิเคราะห์คำค้น (query) ด้วย GPT-4O-mini
 * และคืนค่าเป็น filters สำหรับ Qdrant
 * รูปแบบ JSON:
 * {
 *   gender?: string[];
 *   relationshipStatus?: string[];
 *   locationTokens?: string[];
 *   birthYearRange?: { gte: number; lte: number }[];
 *   interests?: string[];
 * }
 */
export async function extractSemanticFilters(query: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `คุณเป็นผู้ช่วยที่แปลงคำค้นหาเป็นเงื่อนไขกรองข้อมูลผู้ใช้
Return JSON object with keys: gender, relationshipStatus, locationTokens, birthYearRange, interests.
Example: {"gender":["female"],"relationshipStatus":["single"],"locationTokens":["เชียงใหม่"],"birthYearRange":[{"gte":1985,"lte":1985}],"interests":["coffee","board games"]}`,
      },
      { role: "user", content: `Parse filters from query: "${query}"` },
    ],
  });
  try {
    const content = completion.choices[0].message.content;
    const parsed: any = JSON.parse(content ?? "{}");
    return parsed;
  } catch (e) {
    console.error("extractSemanticFilters parse error:", e);
    return {};
  }
}

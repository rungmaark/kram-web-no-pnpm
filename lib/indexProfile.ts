// lib/indexProfile.ts

export async function indexUser(user: {
  mongoId: string;
  username: string;
  displayName: string;
  bio?: string;
  MBTI?: string;
  gender?: string;
  relationshipStatus?: string;
  careers?: string[];
  birthYear?: number | null;
  locationTokens?: string[];
  rawProfileText?: string;
}) {
  // ❌ ลบทิ้งทั้งหมด ไม่ต้อง upsert ไป qdrant แล้ว
  // หรือจะเหลือไว้ log ก็ได้
  console.log("🪪 indexUser ถูกเรียก:", user.username);
}

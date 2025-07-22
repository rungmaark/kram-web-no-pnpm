// lib/utils/safeJsonParse.ts

/* -------------------- Helper -------------------- */
/** แก้ JSON array ที่มีคอมม่าเกินหน้า ] แล้วค่อย parse */
function safeJsonParse(raw: string): unknown {
  // ตัด  ,  ที่อยู่ก่อน ]   เช่น  ["a","b",]  -> ["a","b"]
  const cleaned = raw.replace(/,\s*]/g, "]");
  return JSON.parse(cleaned);
}

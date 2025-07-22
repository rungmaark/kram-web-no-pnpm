// lib/normalizeStatus.ts
const map: Record<string, string> = {
  single: "single",
  โสด: "single",
  คนโสด: "single",
  alone: "single",
  ไม่มีแฟน: "single",
  taken: "taken",
  หัวใจไม่ว่าง: "taken",
  มีแฟน: "taken",
  married: "married",
  แต่งงานแล้ว: "married",
  สมรส: "married",
  fwb: "fwb",
  "มี fwb": "fwb",
};

export function normalizeStatus(raw?: string | null) {
  if (!raw) return null;
  return map[raw.trim().toLowerCase()] ?? null;
}

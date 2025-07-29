// lib/utils/location.ts
// -------------------------------------------------
// 1) ฟังก์ชันขยายตัวย่อเป็นคำเต็ม
function expandLocationAbbrev(tok: string): string[] {
  // ม.ศรีปทุม  ->  ม.ศรีปทุม , มหาวิทยาลัยศรีปทุม
  const mUni = tok.match(/^ม\.\s*(.+)$/i);
  if (mUni) return [tok, `มหาวิทยาลัย${mUni[1]}`];

  // จ.เชียงใหม่ -> จ.เชียงใหม่ , จังหวัดเชียงใหม่
  const mProv = tok.match(/^จ\.\s*(.+)$/i);
  if (mProv) return [tok, `จังหวัด${mProv[1]}`];

  // อ.หาดใหญ่  -> อ.หาดใหญ่ , อำเภอหาดใหญ่
  const mAmp = tok.match(/^อ\.\s*(.+)$/i);
  if (mAmp) return [tok, `อำเภอ${mAmp[1]}`];

  return [tok];
}

// -------------------------------------------------
// 2) ฟังก์ชันสร้าง locationTokens
export function makeLocationTokens(full: string | null | undefined): string[] {
  if (!full) return [];
  const tokens = new Set<string>();

  full
    .split(",") // แยกด้วย comma
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((part) => {
      // เก็บต้นฉบับ (lower-case)
      const lc = part.toLowerCase();
      tokens.add(lc);

      // เก็บรูปย่อ/คำเต็ม (lower-case เช่นกัน)
      expandLocationAbbrev(part).forEach((t) => tokens.add(t.toLowerCase()));
    });

  return [...tokens];
}

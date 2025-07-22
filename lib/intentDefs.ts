// lib/intentDefs.ts

// ===== Intent definitions (synonym clusters) =====
export type IntentCluster = {
  field: "gender" | "careers" | "relationshipStatus" | "interests"; // ขยายได้
  label: string; // ค่าที่จริงจะเก็บใน Mongo/Qdrant
  synonyms: string[]; // คำค้นไทย/อังกฤษ
};

export const mbtiClusters = [
  { field: "MBTI", label: "INTJ", synonyms: ["INTJ","ไอเอ็นทีเจ"] },
  { field: "MBTI", label: "INFJ", synonyms: ["INFJ","ไอเอ็นเอฟเจ"] },
];

/** NOTE: เริ่มใส่เท่านี้ก่อน แล้วดู log เพิ่มภายหลังได้ */
export const intentClusters: IntentCluster[] = [
  // ---------- Gender ----------
  {
    field: "gender",
    label: "male",
    synonyms: [
      "ผู้ชาย",
      "ชาย",
      "หนุ่ม",
      "สุภาพบุรุษ",
      "ชายหนุ่ม",
      "man",
      "male",
    ],
  },
  {
    field: "gender",
    label: "female",
    synonyms: [
      "ผู้หญิง",
      "หญิง",
      "สาว",
      "สุภาพสตรี",
      "สตรี",
      "female",
      "girl",
      "woman",
      "women",
    ],
  },
  {
    field: "gender",
    label: "gay",
    synonyms: ["gay", "เกย์", "ชายรักชาย"],
  },
  {
    field: "gender",
    label: "bisexual",
    synonyms: ["ชอบสองเพศ", "ไบ", "ไบเซ็กชวล", "ชอบทั้งชายและหญิง", "Bisexual"],
  },
  {
    field: "gender",
    label: "lesbian",
    synonyms: ["หญิงรักหญิง", "เลสเบี้ยน", "เลส", "lesbian"],
  },
  {
    field: "gender",
    label: "transgender",
    synonyms: ["สาวสอง", "หญิงข้ามเพศ", "ทรานส์", "transgender"],
  },

  // ---------- Relationship Status ----------
  {
    field: "relationshipStatus",
    label: "single",
    synonyms: ["โสด", "ไม่มีแฟน", "single"],
  },
  {
    field: "relationshipStatus",
    label: "taken",
    synonyms: [
      "มีแฟน",
      "in a relationship",
      "taken",
      "มีคู่",
      "มีคนรัก",
      "มีหวานใจ",
    ],
  },
  {
    field: "relationshipStatus",
    label: "married",
    synonyms: ["แต่งงานแล้ว", "สมรส", "married"],
  },
  {
    field: "relationshipStatus",
    label: "fwb",
    synonyms: [
      "fwb",
      "เพื่อนกันแบบมีอะไรกัน",
      "friends with benefits",
      "มีเซ็กส์กับเพื่อน",
      "ไม่ผูกมัด",
    ],
  },
  
];

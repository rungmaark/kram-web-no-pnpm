// lib/intentConcepts.ts

export type Concept = {
  field: "gender" | "interests" | "MBTI" | "relationshipStatus";
  label: string; // เช่น "Dog"
  synonyms: string[];
  embedding?: number[]; // จะเติมทีหลัง
};

const mbtiConcepts: Concept[] = [
  { field: "MBTI", label: "INTJ", synonyms: ["INTJ"] },
  { field: "MBTI", label: "INTP", synonyms: ["INTP"] },
  { field: "MBTI", label: "ENTJ", synonyms: ["ENTJ"] },
  { field: "MBTI", label: "ENTP", synonyms: ["ENTP"] },
  { field: "MBTI", label: "INFJ", synonyms: ["INFJ"] },
  { field: "MBTI", label: "INFP", synonyms: ["INFP"] },
  { field: "MBTI", label: "ENFJ", synonyms: ["ENFJ"] },
  { field: "MBTI", label: "ENFP", synonyms: ["ENFP"] },
  { field: "MBTI", label: "ISTJ", synonyms: ["ISTJ"] },
  { field: "MBTI", label: "ISFJ", synonyms: ["ISFJ"] },
  { field: "MBTI", label: "ESTJ", synonyms: ["ESTJ"] },
  { field: "MBTI", label: "ESFJ", synonyms: ["ESFJ"] },
  { field: "MBTI", label: "ISTP", synonyms: ["ISTP"] },
  { field: "MBTI", label: "ISFP", synonyms: ["ISFP"] },
  { field: "MBTI", label: "ESTP", synonyms: ["ESTP"] },
  { field: "MBTI", label: "ESFP", synonyms: ["ESFP"] },
];

const genderConcepts: Concept[] = [
  {
    field: "gender",
    label: "male",
    synonyms: [
      "male",
      "man",
      "men",
      "boy",
      "ผู้ชาย",
      "หนุ่ม",
      "ชาย",
      "สุภาพบุรุษ",
    ],
  },
  {
    field: "gender",
    label: "female",
    synonyms: ["female", "women", "woman", "girl"],
  },
  { field: "gender", label: "gay", synonyms: ["gay", "เกย์"] },
  { field: "gender", label: "lesbian", synonyms: ["lesbian", "เลสเบี้ยน"] },
  { field: "gender", label: "bisexual", synonyms: ["bisexual", "ไบเซ็กชวล"] },
  {
    field: "gender",
    label: "transgender",
    synonyms: ["transgender", "ทรานส์เจนเดอร์"],
  },
];

export const concepts: Concept[] = [
  ...mbtiConcepts,
  ...genderConcepts,
];

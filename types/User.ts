// types/User.ts
// ------------------------------
// โครงสร้างข้อมูลผู้ใช้ฝั่ง Front‑end
// * ตัด field ที่ละเอียดอ่อน (password) ออก
// * "userId" แทน _id เพื่อให้สื่อความหมายชัดเจนเวลาส่งมาจาก cookie/session
// ------------------------------

export interface User {
  /** MongoDB ObjectId ในรูป string */
  userId: string;
  /** @example "mark" */
  username: string;
  /** ชื่อที่แสดงบน UI */
  displayName: string;

  // ---------- ข้อมูลโปรไฟล์เพิ่มเติม ----------
  gender?: string;
  bio?: string;
  profileImage?: string; // key S3 หรือ URL เต็ม
  email?: string;
  emailVerified?: boolean;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  currentCity?: string;
  MBTI?: string;
  relationshipStatus?: string;
  birthYear?: number;
  interests?: {
    interestName: string;
    category: string;
  }[];
  theme?: string;
}

/** สำหรับ Context/​Cookie ที่ต้องการเฉพาะข้อมูลหลัก */
export type MinimalUser = Pick<
  User,
  "userId" | "username" | "displayName" | "profileImage" | "gender" | "email"
>;

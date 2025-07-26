// app/privacy/page.tsx

import PrivacyConsentButton from "@/components/PrivacyConsentButton";
import Link from "next/link";
import { X } from "lucide-react";


export default function PrivacyPage() {
    return (
        <div className="relative min-h-screen bg-white dark:bg-[#18191A] overflow-hidden">
            {/* ❌ ปุ่มกากบาทขวาบน */}
            <Link
                href="/"
                className="fixed top-4 right-4 z-50 p-2 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition"
                aria-label="Close"
            >
                <X className="w-5 h-5 text-black dark:text-white" />
            </Link>
            
            {/* gradient overlay */}
            <div className="absolute inset-0 h-64 pointer-events-none z-0 
            bg-gradient-to-b from-[#e8f0f7]/60 to-transparent 
            dark:from-[#1f2730]/60" />

            {/* main content */}
            <div className="relative z-10 max-w-3xl mx-auto px-6 py-12 text-gray-800 dark:text-gray-200 font-kanit">
                <h1 className="text-2xl font-bold mb-6 text-black dark:text-white">🕊️ นโยบายความเป็นส่วนตัวของ Kram</h1>

                <section className="space-y-4 mb-10">
                    <h2 className="text-lg font-semibold text-black dark:text-white">💡 Kram คืออะไร</h2>
                    <p className="text-gray-700 dark:text-gray-300">
                        Kram เป็น Human Search Engine ที่ช่วยให้ผู้คนค้นพบกันได้จากคุณลักษณะที่แท้จริง — โดยคุณสามารถเลือกได้ว่าต้องการเปิดเผยข้อมูลใด และให้คนค้นพบคุณในแบบไหน
                    </p>
                </section>

                <section className="space-y-4 mb-10">
                    <h2 className="text-lg font-semibold text-black dark:text-white">📋 เราเก็บข้อมูลอะไรบ้าง</h2>
                    <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300">
                        <li>ชื่อเล่น หรือ display name</li>
                        <li>ข้อมูลที่คุณเลือกกรอก เช่น ปีเกิด, MBTI, สถานะความสัมพันธ์, ที่อยู่ปัจจุบัน</li>
                        <li>รูปโปรไฟล์</li>
                        <li>บทความที่คุณเขียนอธิบายตัวเอง จะถูกนำไปวิเคราะห์ด้วย AI อย่างละเอียด และจัดเก็บ</li>
                        <li>Cookie สำหรับระบบ session และการแสดงผล</li>
                    </ul>
                </section>

                <section className="space-y-4 mb-10">
                    <h2 className="text-lg font-semibold text-black dark:text-white">🎯 เราใช้ข้อมูลคุณอย่างไร</h2>
                    <p className="text-gray-700 dark:text-gray-300">
                        เรานำข้อมูลที่คุณกรอกไปประมวลผลเพื่อทำให้ระบบค้นหาของ Kram ทำงานได้อย่างชาญฉลาดและตรงจุด โดยข้อมูลจะไม่ถูกแชร์หรือเปิดเผยต่อสาธารณะ
                    </p>
                </section>

                <section className="space-y-4 mb-10">
                    <h2 className="text-lg font-semibold text-black dark:text-white">🔐 สิทธิของคุณ</h2>
                    <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300">
                        <li>คุณสามารถใช้งาน Kram ได้โดยไม่ต้องกรอกข้อมูลใด ๆ</li>
                        <li>คุณสามารถแก้ไข หรือลบข้อมูลของตัวเองได้ทุกเมื่อ</li>
                        <li>เราจะไม่แสดงข้อมูลของคุณในระบบค้นหา หากคุณไม่เคยกรอกข้อมูลเลย</li>
                    </ul>
                </section>

                <section className="space-y-4 mb-10">
                    <h2 className="text-lg font-semibold text-black dark:text-white">🎯 เราใช้ข้อมูลคุณอย่างไร</h2>
                    <p className="text-gray-700 dark:text-gray-300">
                        {"ข้อมูลที่คุณกรอกจะถูกใช้เพื่อปรับปรุงความแม่นยำในการค้นหา และช่วยให้ผู้คนค้นพบโปรไฟล์ของคุณได้จากคุณลักษณะที่คุณเลือกเปิดเผย เช่น ชื่อเล่น ปีเกิด ที่อยู่ปัจจุบัน คุณสมบัติเฉพาะตัว(สิ่งที่ชอบ, งานอดิเลข)"}
                        <br /><br />
                        โปรไฟล์ของคุณจะถูกแสดงต่อสาธารณะเฉพาะในส่วนที่คุณยินยอมให้เปิดเผย และเราจะไม่มีการเปิดเผยข้อมูลที่ละเอียดอ่อนหรือส่วนที่คุณไม่ได้กรอก
                    </p>
                </section>


                <section className="space-y-4 mb-10">
                    <h2 className="text-lg font-semibold text-black dark:text-white">🛡️ การปกป้องข้อมูลของคุณ</h2>
                    <p className="text-gray-700 dark:text-gray-300">
                        ข้อมูลของคุณถูกเข้ารหัสและจัดเก็บอย่างปลอดภัย เราไม่เปิดเผยข้อมูลของคุณกับบุคคลที่สาม
                    </p>
                </section>
            </div>
            <PrivacyConsentButton />
        </div>
    );
}

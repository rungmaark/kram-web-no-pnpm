// components/CookieConsent.tsx
"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { usePathname } from "next/navigation";

export default function CookieConsent() {
    const [visible, setVisible] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const consent = Cookies.get("cookie_consent");
        const isPrivacyPage = pathname === "/privacy";

        // แสดง popup เฉพาะถ้า user ยังไม่ได้ accept และไม่ได้อยู่หน้า /privacy
        if (!consent && !isPrivacyPage) {
            setVisible(true);
        }
    }, [pathname]);

    const accept = () => {
        Cookies.set("cookie_consent", "true", { expires: 365 });
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 text-black dark:text-white p-6 shadow-2xl rounded-2xl max-w-lg w-full mx-4">
                <p className="mb-4 text-sm">
                    Kram เป็น Human Search Engine ที่ออกแบบมาเพื่อจัดเก็บข้อมูลของผู้คนที่ซับซ้อนในรูปแบบที่สามารถถูกค้นหาได้ ✨
                    <br /><br />
                    เราใช้ cookies เพื่อให้ระบบต่าง ๆ ทำงานได้ตามปกติ และหากคุณเลือกกรอกข้อมูล ข้อมูลโปรไฟล์ของคุณจะถูกนำไปประมวลผลเพื่อให้ผู้คนสามารถค้นหาคุณได้อย่างมีประสิทธิภาพสูงสุด โดยขึ้นอยู่กับสิ่งที่คุณยินยอมเปิดเผย
                    <br /><br />
                    คุณสามารถใช้งานแพลตฟอร์มได้โดยไม่จำเป็นต้องกรอกข้อมูลใด ๆ หากยังไม่พร้อม 💛
                    <br /><br />
                    อ่านเพิ่มเติมได้ที่{" "}
                    <a href="/privacy" className="underline">
                        นโยบายความเป็นส่วนตัว
                    </a>
                </p>

                <div className="text-right">
                    <button
                        onClick={accept}
                        className="bg-black text-white px-5 py-2 rounded hover:bg-gray-800 cursor-pointer"
                    >
                        ตกลง
                    </button>
                </div>
            </div>
        </div>
    );
}

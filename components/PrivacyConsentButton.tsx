// components/PrivacyConsentButton.tsx
"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation"; // ✅ เพิ่ม

export default function PrivacyConsentButton() {
    const [show, setShow] = useState(false);
    const [canAccept, setCanAccept] = useState(false);
    const router = useRouter(); // ✅ เรียกใช้ router

    useEffect(() => {
        const consent = Cookies.get("cookie_consent");
        if (!consent) setShow(true);

        const handleScroll = () => {
            const doc = document.documentElement;
            if (window.innerHeight + window.scrollY >= doc.scrollHeight - 2) {
                setCanAccept(true);
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const accept = () => {
        Cookies.set("cookie_consent", "true", { expires: 365 });
        setShow(false);
        router.push("/"); // ✅ เด้งกลับหน้า /
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-0 inset-x-0 bg-white dark:bg-[#18191A] p-4 text-center shadow-inner z-50">
            <button
                onClick={accept}
                disabled={!canAccept}
                className={`px-6 py-2 rounded-full transition 
                    ${canAccept
                        ? 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90 cursor-pointer'
                        : 'bg-gray-700 text-gray-200 opacity-75 cursor-not-allowed'}`}
            >
                รับทราบ
            </button>
        </div>
    );
}

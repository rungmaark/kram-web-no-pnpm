// components/ThemeProvider.tsx
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    // ① อ่านจาก session ก่อน ถ้าไม่มี อ่านจาก localStorage
    const [theme, setTheme] = useState<string>(
        session?.user?.theme ?? (typeof window !== "undefined" ? localStorage.getItem("theme") || "system" : "system")
    );

    // ② ถ้ามี session.user.theme มาใหม่ ให้ override state
    useEffect(() => {
        const root = document.documentElement;
        // apply theme: dark/light behave explicitly; anything else falls
        // back to system preference. This makes it safe to add new theme
        // values in the future without breaking dark mode toggling.
        if (theme === "dark") {
            root.classList.add("dark");
        } else if (theme === "light") {
            root.classList.remove("dark");
        } else if (theme === "system") {
            const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            root.classList.toggle("dark", isDark);
        } else {
            // unknown theme values behave like system by default
            const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            root.classList.toggle("dark", isDark);
        }

        // ฟังกรณี localStorage ถูกเปลี่ยนจาก tab อื่น
        const onStorage = (e: StorageEvent) => {
            if (e.key === "theme" && e.newValue) {
                setTheme(e.newValue);
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [theme]);

    return <>{children}</>;
}

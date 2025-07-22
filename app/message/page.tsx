// app/message/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ChatWindow from "@/components/ChatWindow";
import ConversationSideBar from "@/components/ConversationSideBar";
import { PanelLeftOpen, PanelRightClose, ArrowLeft } from "lucide-react";
import VerticalNavbar from "@/components/VerticalNavbar";

export default function MessagePage() {
  const router = useRouter();
  const params = useSearchParams();
  const initialConversationId = params?.get("conversationId") ?? null;

  const [selectedId, setSelectedId] = useState<string | null>(
    initialConversationId
  );
  const [checkingSession, setCheckingSession] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // ✅ ตรวจสอบขนาดหน้าจอ
  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session", {
          credentials: "include",
        });
        const data = await res.json();
        if (!data.user) router.push("/signup");
      } catch {
        router.push("/signup");
      } finally {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, [router]);

  useEffect(() => {
    const idInUrl = params?.get("conversationId") ?? null;
    if (idInUrl !== selectedId) setSelectedId(idInUrl);
  }, [params, selectedId]);

  if (checkingSession) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 dark:text-gray-300">
        Checking login...
      </div>
    );
  }

  // ✅ เงื่อนไขสำหรับมือถือ
  if (isMobile) {
    if (!selectedId) {
      return (
        <div className="h-screen w-full flex flex-row bg-black text-white">
          {/* ⬅️ แสดง VerticalNavbar */}
          <VerticalNavbar />

          {/* ⬅️ แสดง ConversationSidebar เต็มพื้นที่ที่เหลือ */}
          <div className="flex-1">
            <ConversationSideBar selectedId={null} onSelect={setSelectedId} />
          </div>
        </div>
      );
    } else {
      return (
        <div className="h-screen w-full bg-black text-white relative">
          <ChatWindow conversationId={selectedId} />
        </div>
      );
    }
  }

  // ✅ ปกติ (desktop)
  return (
    <div className="flex h-screen w-full bg-black text-white">
      {/* Vertical Navbar ทางซ้าย */}
      <VerticalNavbar />

      <aside
        className={`${sidebarOpen ? "w-auto" : "w-0 overflow-hidden"}`}
      >
        <ConversationSideBar selectedId={selectedId} onSelect={setSelectedId} />
      </aside>

      <main className="flex-1 relative overflow-hidden">
        <ChatWindow conversationId={selectedId} />
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="absolute top-4 left-4 z-30 p-2 rounded-full bg-zinc-900 shadow-md sm:hidden"
        >
          {sidebarOpen ? (
            <PanelRightClose className="w-5 h-5 text-white" />
          ) : (
            <PanelLeftOpen className="w-5 h-5 text-white" />
          )}
        </button>
      </main>
    </div>
  );
}

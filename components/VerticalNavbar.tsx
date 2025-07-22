// components/VerticalNavbar.tsx

"use client";

import { useRouter, usePathname } from "next/navigation";
import { Quote, MessageCircle, User as UserIcon, Search } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function VerticalNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const iconButtonClass = (path: string) =>
    `p-2 rounded-xl transition-all ${
      pathname === path
        ? "bg-kramblue text-white"
        : "text-gray-400 hover:text-white hover:bg-gray-800"
    }`;

  return (
    <div className="h-full w-14 flex flex-col items-center py-4 border-r border-white/10 bg-black space-y-4">
      {/* Logo (คลิกเพื่อกลับ Home) */}
      <img
        src="/image/KramOwl.svg"
        className="w-8 h-8 mb-4 cursor-pointer"
        onClick={() => router.push("/")}
      />

      <button className={iconButtonClass("/")} onClick={() => router.push("/")}>
        <Search className="w-5 h-5 cursor-pointer" />
      </button>

      <button
        className={iconButtonClass("/feed")}
        onClick={() => router.push("/feed")}
      >
        <Quote className="w-5 h-5 cursor-pointer" />
      </button>

      {user && (
        <button
          className={iconButtonClass("/message")}
          onClick={() => router.push("/message")}
        >
          <MessageCircle className="w-5 h-5 cursor-pointer" />
        </button>
      )}

      {user && (
        <button
          className={
            pathname?.startsWith(`/profile/${user?.username}`)
              ? "bg-kramblue text-white p-2 rounded-xl"
              : "text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-xl"
          }
          onClick={() => router.push(`/profile/${user?.username}`)}
        >
          <UserIcon className="w-5 h-5 cursor-pointer" />
        </button>
      )}
    </div>
  );
}

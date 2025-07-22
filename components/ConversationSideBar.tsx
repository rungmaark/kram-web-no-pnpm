// components/ConversationSideBar.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const avatarByGender: Record<string, string> = {
  male: "/image/blue-owl.png",
  female: "/image/pink-owl.png",
  gay: "/image/green-owl.png",
  lesbian: "/image/purple-owl.png",
  bisexual: "/image/yellow-owl.png",
  transgender: "/image/red-owl.png",
};
const defaultAvatar = "/image/gray-owl.png";

export default function ConversationSideBar({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (conversationId: string) => void;
}) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setCurrentUserId(d.user?.id ?? null));
  }, []);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/auth/conversation", {
        credentials: "include",
      });
      if (res.ok) setConversations(await res.json());
    };
    load();
  }, []);

  const open = (id: string) => {
    onSelect(id);
    router.replace(`/message?conversationId=${id}`);
  };

  return (
    <aside className="h-full w-full sm:w-16 md:w-72 bg-black text-white border-r border-white/10 overflow-y-auto">
      {conversations.map((c) => {
        const isGroup = c.isGroup;
        const other =
          c.participants.find((p: any) => p._id !== currentUserId) ?? c.participants[0];


        const avatar = other.profileImage
          ? `/api/image?key=${encodeURIComponent(other.profileImage)}`
          : avatarByGender[other.gender ?? ""] ?? defaultAvatar;


        return (
          <div
            key={c._id}
            onClick={() => open(c._id)}
            className={`flex gap-3 items-center px-4 py-3 cursor-pointer hover:bg-[#1a1a1a] ${selectedId === c._id ? "bg-[#262626]" : ""
              }`}
          >
            {!isGroup && (
              <Image
                src={avatar}
                alt="avatar"
                width={40}
                height={40}
                style={{ width: 40, height: 40 }}
                className="rounded-full shrink-0 object-cover"
              />
            )}
            <div className="min-w-0 h-10 flex flex-col justify-center ml-2 flex sm:hidden md:flex">
              <div className="text-sm font-medium truncate">
                {isGroup ? c.name : other.displayName}
              </div>
              <div className="text-xs text-gray-400 truncate">
                {c.lastMessage?.text ?? ""}
              </div>
            </div>
          </div>
        );
      })}
    </aside>
  );
}

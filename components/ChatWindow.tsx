// components/ChatWindow.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import io, { Socket } from "socket.io-client";
import { ArrowLeft } from "lucide-react";

const avatarByGender: Record<string, string> = {
  male: "/image/blue-owl.png",
  female: "/image/pink-owl.png",
  gay: "/image/green-owl.png",
  lesbian: "/image/purple-owl.png",
  bisexual: "/image/yellow-owl.png",
  transgender: "/image/red-owl.png",
};
const defaultAvatar = "/image/gray-owl.png";

export default function ChatWindow({
  conversationId: propId,
}: {
  conversationId: string | null;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const conversationIdParam = params?.get("conversationId") ?? null;
  const targetUserId = params?.get("userId") ?? null;

  const [conversationId, setConversationId] = useState<string | null>(null);

  // useEffect เพื่อ sync กับ propId
  useEffect(() => {
    setConversationId(propId);
  }, [propId]);

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [senderInfoMap, setSenderInfoMap] = useState<
    Record<string, { displayName: string; gender: string }>
  >({});
  const [targetDisplayName, setTargetDisplayName] = useState<string | null>(
    null
  );
  const [targetProfileImage, setTargetProfileImage] = useState<string | null>(null);
  const [targetUsername, setTargetUsername] = useState<string | null>(null);
  const [targetGender, setTargetGender] = useState<string | null>(null);
  const [isGroup, setIsGroup] = useState(false);
  const [groupTitle, setGroupTitle] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false); // 👈 เพิ่ม

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => setCurrentUserId(d.user?.id ?? null));
  }, []);

  useEffect(() => {
    fetch("/api/socketio");
    const sock = io({ path: "/api/socketio" });
    socketRef.current = sock;

    sock.on("connect", () => {
      if (conversationId) sock.emit("join", conversationId);
    });

    sock.on("new_message", (msg: any) => {
      setMessages((prev) =>
        prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]
      );
    });

    // ✅ Return cleanup function ที่ถูกต้อง
    return () => {
      sock.disconnect();
    };
  }, []);

  // 🟡 เพิ่ม useEffect ใหม่เพื่อ join ห้องใหม่เมื่อ conversationId เปลี่ยน
  useEffect(() => {
    if (conversationId && socketRef.current?.connected) {
      socketRef.current.emit("join", conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    fetch(`/api/auth/message?conversationId=${conversationId}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => setMessages(data));
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || currentUserId == null) return;

    fetch(`/api/auth/conversation/${conversationId}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        setIsGroup(data.isGroup);
        if (data.isGroup) setGroupTitle(data.name ?? "Group Chat");
        const other = data.participants.find(
          (p: any) => p._id !== currentUserId
        );
        if (other) {
          setTargetDisplayName(other.displayName);
          setTargetGender(other.gender);
          setTargetProfileImage(other.profileImage ?? null)
          setTargetUsername(other.username ?? null)
        }
      });
  }, [conversationId, currentUserId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationId]);

  const send = async () => {
    if (!input.trim()) return;

    let cId = conversationId;
    if (!cId && targetUserId) {
      const resC = await fetch("/api/auth/conversation/get-or-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
        credentials: "include",
      });
      const { _id } = await resC.json();
      cId = _id;
      setConversationId(_id);
      router.replace(`/message?conversationId=${_id}`);
      socketRef.current?.emit("join", _id);
    }

    const res = await fetch("/api/auth/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: cId, text: input }),
      credentials: "include",
    });

    const msg = await res.json();
    socketRef.current?.emit("client_new_message", msg);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Header */}
      {(targetDisplayName || isGroup) && (
        <div className="flex items-center gap-2.5 px-2 py-3 border-b border-white/10 relative">
          {/* 🔙 ปุ่ม Back เฉพาะมือถือ */}
          {isMobile && (
            <button
              onClick={() => {
                router.replace("/message");
                setConversationId(null);
              }}
              className="ml-3 text-gray-300 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {!isGroup && (
            <Image
              src={
                targetProfileImage
                  ? `/api/image?key=${encodeURIComponent(targetProfileImage)}`
                  : avatarByGender[targetGender ?? ""] ?? defaultAvatar
              }
              width={32}
              height={32}
              style={{ width: 32, height: 32 }}
              alt="avatar"
              className="rounded-full ml-8 object-cover" // 👈 ขยับให้ชิดขวาปุ่ม back
            />
          )}
          <span className="text-base font-semibold truncate cursor-pointer"
            onClick={() => {
              if (targetUsername) router.push(`/profile/${targetUsername}`);
            }}
          >
            {isGroup ? groupTitle : targetDisplayName}
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {messages.map((m, i) => {
          const isMine = m.sender?._id === currentUserId;
          return (
            <div
              key={m._id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-[70%] break-words ${isMine ? "bg-[#3797EF] text-white" : "bg-[#262626] text-white"
                  }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10 flex items-center gap-2">
        <input
          className="flex-1 bg-[#262626] text-white px-4 py-2 rounded-full outline-none"
          placeholder="Message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="text-[#3797EF] font-medium disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

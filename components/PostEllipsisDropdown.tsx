// components/PostEllipsisDropdown.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import {
  Ellipsis,
  Frown,
  UserPlus,
  VolumeOff,
  Ban,
  MessageSquareHeart,
  Pencil,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SwalWithTheme } from "@/lib/swal";
import EditPostModal from "./EditPostModal";
import { useSession } from "next-auth/react";

type Props = {
  username: string; // คนโพสต์
  currentUsername?: string; // คนดู
  postId: string;
};

export default function PostEllipsisDropdown({
  username,
  currentUsername,
  postId,
}: Props) {
  const { data: session } = useSession();
  const [isFollowing, setIsFollowing] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isOwner = username === currentUsername;

  // ปิด dropdown เมื่อคลิกนอก component
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchUserId() {
      try {
        const res = await fetch(`/api/user-by-username?username=${username}`);
        const data = await res.json();
        setTargetUserId(data._id);
      } catch (err) {
        console.error("Error fetching target user ID:", err);
      }
    }
    fetchUserId();
  }, [username]);

  useEffect(() => {
    async function fetchStatus() {
      if (!targetUserId) return;

      const res = await fetch(
        `/api/auth/follow/status?profileId=${targetUserId}`,
        {
          credentials: "include",
        }
      );
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);
      }
    }
    fetchStatus();
  }, [targetUserId]);

  async function toggleFollow() {
    if (!targetUserId) return;

    const res = await fetch("/api/auth/follow/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId }),
      credentials: "include",
    });

    if (res.ok) {
      const data = await res.json();
      setIsFollowing(data.isFollowing);
      setShowMenu(false);
    } else {
      alert("Follow failed");
    }
  }

  const handleDelete = async () => {
    const confirm = await SwalWithTheme.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "โพสต์นี้จะถูกลบแบบถาวร",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
      customClass: {
        popup: "dark", // 👈 เพิ่ม class นี้ แล้วจัดการ style ใน global CSS
      },
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch("/api/auth/post/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId }),
        });

        const data = await res.json();
        if (!res.ok) {
          SwalWithTheme.fire({
            title: "เกิดข้อผิดพลาด",
            text: data.error || "ลบโพสต์ไม่สำเร็จ",
            customClass: {
              popup: "dark", // 👈 เพิ่ม class นี้ แล้วจัดการ style ใน global CSS
            },
          });
          return;
        }

        SwalWithTheme.fire({
          title: "ลบแล้ว!",
          text: "โพสต์ของคุณถูกลบเรียบร้อย",
          icon: "success",
          customClass: {
            popup: "dark", // 👈 เพิ่ม class นี้ แล้วจัดการ style ใน global CSS
          },
        }).then(() => {
          window.location.reload(); // หรือ router.refresh()
        });
      } catch (error) {
        console.error("Failed to delete post", error);
        SwalWithTheme.fire({
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถลบโพสต์ได้",
          icon: "error",
        });
      }
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <Ellipsis
        className="size-5 lg:mr-4 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setShowMenu((prev) => !prev)}
      />
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.075 }}
            className="absolute right-0 top-0 w-auto bg-white dark:bg-[#1e1e1e] bg-opacity-90 backdrop-blur-sm shadow-xl rounded-md text-sm z-10 overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {isOwner ? (
              <>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowEditModal(true);
                  }}
                  className="whitespace-nowrap w-full pl-4 pr-20 py-2 text-left text-gray-800 dark:text-gray-100 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 cursor-pointer"
                >
                  <Pencil className="size-4.5" />
                  Edit Post
                </button>
                <button
                  onClick={handleDelete}
                  className="whitespace-nowrap w-full pl-4 pr-20 py-2 text-left text-red-600 dark:text-red-400 font-semibold hover:bg-red-100 dark:hover:bg-red-800 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="size-4.5" />
                  Delete Post
                </button>
              </>
            ) : (
              <>
                {[
                  // {
                  //   icon: <Frown className="size-4.5" />,
                  //   label: "Not Interested",
                  // },
                  // {
                  //   icon: <MessageSquareHeart className="size-4.5" />,
                  //   label: "Interested",
                  // },
                  {
                    icon: <UserPlus className="size-4.5" />,
                    label: isFollowing
                      ? `Unfollow @${username}`
                      : `Follow @${username}`,
                    onClick: toggleFollow,
                  },
                  // {
                  //   icon: <VolumeOff className="size-4.5" />,
                  //   label: `Mute @${username}`,
                  //   onClick: () => console.log("mute", username),
                  // },
                  // {
                  //   icon: <Ban className="size-4.5" />,
                  //   label: `Block @${username}`,
                  //   onClick: () => console.log("block", username),
                  // },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={item.onClick}
                    className="whitespace-nowrap w-full pl-4 pr-20 py-2 text-left text-gray-800 dark:text-gray-100 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 cursor-pointer"
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {showEditModal && (
        <EditPostModal
          postId={postId}
          initialText={(
            document.querySelector(`[data-post-id="${postId}"]`)?.textContent ||
            ""
          ).trim()}
          initialLocation={
            document
              .querySelector(`[data-post-id="${postId}"]`)
              ?.getAttribute("data-location") || ""
          }
          onClose={() => setShowEditModal(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
}

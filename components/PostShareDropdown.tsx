// components/PostShareDropdown.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Link as LinkIcon } from "lucide-react";

type Props = {
  postId: string;
  username: string;
};

export default function PostShareDropdown({ postId, username }: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/feed/${username}/${postId}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // รีเซ็ตเป็น Copy link ภายใน 2 วินาที
    } catch {
      console.error("Copy failed");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowMenu(false);
        setCopied(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <Send
        className="w-4 h-4 cursor-pointer hover:text-kramblue"
        onClick={() => setShowMenu((prev) => !prev)}
      />
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.075 }}
            className="absolute right-0 top-5 w-auto bg-white dark:bg-[#1e1e1e] bg-opacity-90 backdrop-blur-sm shadow-xl rounded-md text-sm z-10 overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <button
              onClick={handleCopyLink}
              className="whitespace-nowrap w-full pl-4 pr-20 py-2 text-left text-gray-800 dark:text-gray-100 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 hover:cursor-pointer"
            >
              <LinkIcon className="size-4.5" />
              {copied ? "Copied" : "Copy link"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

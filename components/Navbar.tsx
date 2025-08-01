// components/Navbar.tsx

"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Quote,
  MessageCircle,
  User as UserIcon,
  Search,
  LogOut,
  Settings,
  Mail,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import SendFeedbackModal from "./SendFeedbackModal";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { data: session, status } = useSession();
  const user = session?.user;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  async function handleSignout() {
    try {
      await signOut({ callbackUrl: '/signup' });
    } catch (error) {
      console.error("Signout failed:", error);
    }
  }

  return (
    <>
      <nav
        className={`flex items-center justify-between ${pathname === "/feed" ? "pl-16" : "pl-4"
          } pr-2 lg:px-0 py-3 backdrop-blur-md bg-white/80 dark:bg-navbarblack/60 shadow-sm sticky top-0 z-20 border-b border-gray-200 dark:border-gray-700 transition dark:text-gray-50`}
      >
        <img
          src="/image/KramLogo.svg"
          className="h-8 sm:h-9 cursor-pointer"
          onClick={() => router.push("/")}
        />

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Home Button */}
          <button
            className={`p-2 rounded-full ${pathname === "/"
              ? "bg-kramblue text-white cursor-pointer"
              : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
              }`}
            onClick={() => router.push("/")}
          >
            <Search className="w-5 h-5" suppressHydrationWarning />
          </button>

          {/* Search Button */}
          <button
            className={`p-2 rounded-full ${pathname === "/feed"
              ? "bg-kramblue text-white cursor-pointer"
              : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
              }`}
            onClick={() => router.push("/feed")}
          >
            <Quote className="w-5 h-5" suppressHydrationWarning />
          </button>

          {/* Message Button */}
          {user && (
            <button
              className={`p-2 rounded-full ${pathname === "/message"
                ? "bg-kramblue text-white cursor-pointer"
                : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                }`}
              onClick={() => router.push("/message")}
            >
              <MessageCircle className="w-5 h-5" suppressHydrationWarning />
            </button>
          )}

          {/* User Profile Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              className={`p-2 rounded-full ${pathname?.startsWith(`/profile/${user?.username}`)
                ? "bg-kramblue text-white cursor-pointer"
                : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                }`}
              onClick={() => {
                if (user) {
                  setIsDropdownOpen((prev) => !prev);
                } else {
                  router.push("/signup");
                }
              }}
            >
              <UserIcon className="w-5 h-5" suppressHydrationWarning />
            </button>

            {/* ======= Dropdown Menu ======= */}
            <AnimatePresence>
              {user && isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.1 }}
                  className="absolute top-12 right-0 w-65 bg-white dark:bg-black bg-opacity-90 backdrop-blur-md shadow-xl rounded-md text-sm z-50 overflow-hidden border border-gray-200 dark:border-gray-700 "
                >
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2 text-gray-800 dark:text-gray-100 font-medium hover:bg-gray-100 dark:hover:bg-[#181818] transition-colors duration-100 cursor-pointer"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      router.push(`/profile/${user.username}`);
                    }}
                  >
                    <UserIcon className="w-4 h-4" /> View Profile
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2 text-gray-800 dark:text-gray-100 font-medium hover:bg-gray-100 dark:hover:bg-[#181818] transition-colors duration-100 cursor-pointer"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      router.push("/settings");
                    }}
                  >
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2 text-gray-800 dark:text-gray-100 font-medium hover:bg-gray-100 dark:hover:bg-[#181818] transition-colors duration-100 cursor-pointer"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setFeedbackOpen(true);
                    }}
                  >
                    <Mail className="w-4 h-4" /> Send feedback
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2 text-gray-800 dark:text-gray-100 font-medium hover:bg-gray-100 dark:hover:bg-[#181818] transition-colors duration-100 cursor-pointer"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleSignout();
                    }}
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>
      <SendFeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
}

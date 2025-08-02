// app/feed/page.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import useSWRInfinite from "swr/infinite";
import { useMediaQuery } from "@/lib/hooks";
import Navbar from "@/components/Navbar";
import PostForm from "@/components/PostForm";
import PostSearch from "@/components/PostSearch";
import PostList from "@/components/PostList";
import { analyzePostSemantic } from "@/lib/ultraStrictSemanticAnalyzerPost";
import { AlignLeft, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PostSearchInput from "@/components/PostSearchInput";
import { IPost } from "@/models/Post";
import { fetcher } from "@/lib/fetcher";
import { getPostKey } from "@/components/PostList";

export default function FeedPage() {
  const [searchText, setSearchText] = useState("");
  const [posts, setPosts] = useState<IPost[]>([]);           // 1. โหลดโพสต์ทั้งหมดไว้
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [openedPostId, setOpenedPostId] = useState<string | null>(null);
  const [universities, setUniversities] = useState<string[]>([]);
  const [careers, setCareers] = useState<string[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);

  // Detect desktop screen
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const userToggled = useRef(false); // ✅ บอกว่า user เป็นคนกดหรือไม่

  useEffect(() => {
    if (isDesktop) {
      setShowSearchBar(true);
    } else {
      if (!userToggled.current) {
        setShowSearchBar(false);
      }
    }
  }, [isDesktop]);

  const handleOpenSearchBar = () => {
    userToggled.current = true; // ✅ ผู้ใช้เปิดเอง
    setShowSearchBar(true);
  };

  const handleCloseSearchBar = () => {
    userToggled.current = false; // ✅ ผู้ใช้ปิดเอง (หรือกด X)
    setShowSearchBar(false);
  };

  const isSemantic = Boolean(searchText.trim());
  const { data: postData, isValidating: postLoading } = useSWRInfinite(
    // ถ้า semantic → กดเรียก API เดียว (page 1)
    isSemantic
      ? (_pageIndex) => `/api/posts/semantic-search?q=${encodeURIComponent(searchText)}`
      : (i, prev) =>
        getPostKey(
          i,
          prev,
          searchText,
          universities,
          careers || [],
          provinces || []
        ),
    fetcher,
    { revalidateOnFocus: false }
  );

  return (
    <div className="dark:bg-black min-h-screen lg:px-30 xl:px-50">
      <Navbar />

      <div className="flex gap-4 container mx-auto relative">
        {/* Toggle Button - (นอก sidebar) */}
        {!showSearchBar && (
          <button
            className="lg:hidden fixed top-[11px] left-4 z-50 p-2 rounded-full border shadow-md cursor-pointer
    bg-white dark:bg-[#181818]
    text-black dark:text-white
    border-gray-300 dark:border-gray-600"
            onClick={handleOpenSearchBar}
          >
            <AlignLeft size={20} />
          </button>
        )}

        {/* Sidebar Search */}
        <AnimatePresence>
          {showSearchBar && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 lg:relative lg:inset-auto lg:pt-5"
            >
              {/* Overlay */}
              <div
                className="absolute inset-0 backdrop-blur-xs lg:hidden"
                onClick={handleCloseSearchBar}
              />

              {/* Sidebar */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="
                sidebar-search
                lg:pt-3 w-2/3
                lg:w-[360px] lg:shrink-0 
                lg:max-h-[calc(100vh-64px)] lg:sticky lg:top-[64px] 
                lg:bg-transparent 
                fixed inset-y-0 left-0 pt-12 px-4 
                bg-white dark:bg-black bg-opacity-90 dark:bg-opacity-90 
                backdrop-blur-lg 
                lg:relative lg:inset-auto z-50
              "
                onClick={(e) => e.stopPropagation()} // ⬅️ ป้องกันการปิดเมื่อคลิกใน sidebar
              >
                {/* ปุ่ม X */}
                <button
                  className="absolute top-4 right-4 lg:hidden p-2 rounded-full border shadow-md cursor-pointer
                  bg-white dark:bg-[#181818]
                  text-black dark:text-white
                  border-gray-300 dark:border-gray-600"
                  onClick={handleCloseSearchBar}
                >
                  <X size={20} />
                </button>

                <PostSearch
                  searchText={searchText}
                  onSearchTextChange={setSearchText}
                  onUniversitiesChange={setUniversities}
                  onCareersChange={setCareers}
                  onProvincesChange={setProvinces}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex flex-col flex-1 max-w-[1160px] dark:border-gray-600 px-5 pt-8">
          {/* Search (mobile only) */}
          <div className="block lg:hidden mb-4">
            <PostSearchInput
              searchText={searchText}
              onSearchTextChange={setSearchText}
            />
          </div>
          <PostForm />
          <PostList
            searchText={searchText}
            openedPostId={openedPostId}
            setOpenedPostId={setOpenedPostId}
            universities={universities}
            provinces={provinces}
          />
        </div>
      </div>
    </div>
  );
}

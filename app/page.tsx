// app/page.tsx

"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import SearchResult from "@/components/SearchResult";
import Navbar from "@/components/Navbar";

export default function UsersSearchPage() {
  const [searchText, setSearchText] = useState("");
  const [confirmedSearchText, setConfirmedSearchText] = useState("");

  const suggestions = [
    "หนุ่ม INTP",
    "สาวเล่นวาโล ม.ศรีปทุม",
    "คนเล่น rov",
    "หนุ่มโสดชอบวาดรูป ม.ศรีปทุม",
    "คนเกิด 2007",
    "คนทำ startup",
    "ผู้ชาย INFJ ฟังเพลง Taylor Swift",
    "ผู้หญิงชอบภาษา",
    "คนโสด ม.ศรีปทุม"
  ];

  return (
    <div className="dark:bg-black min-h-screen lg:px-30 xl:px-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Suggestion UI */}
        <div className="mb-6 w-full flex flex-col items-center">
          <div className="flex flex-wrap gap-2 justify-center mb-4 px-4">
            {suggestions.map((text, index) => (
              <button
                key={index}
                onClick={() => setSearchText(text)}
                className="text-xs px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#181818] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
              >
                {text}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar
          searchText={searchText}
          onSearchTextChange={setSearchText}
          onSearch={() => setConfirmedSearchText(searchText)} // ✅ ค้นหาตอนกดปุ่ม
        />
        {/* Results */}
        <SearchResult searchText={confirmedSearchText} />
      </div>
    </div>
  );
}

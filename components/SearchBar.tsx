// components/SearchBar.tsx

"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";

export default function SearchBar({
  onSearchTextChange,
  searchText,
  onSearch,
}: {
  onSearchTextChange: (text: string) => void;
  searchText: string;
  onSearch: () => void;
}) {
  const [internalText, setInternalText] = useState(searchText);

  // อัปเดตเมื่อมี prop เปลี่ยนจากภายนอก (เช่นตอนกด suggestion)
  useEffect(() => {
    setInternalText(searchText);
    onSearchTextChange(searchText);
  }, [searchText]);

  return (
    <div className="relative mb-8 w-full max-w-xl mx-auto flex gap-2">
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
        <input
          type="text"
          value={internalText}
          onChange={(e) => {
            setInternalText(e.target.value);
            onSearchTextChange(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSearch();
            }
          }}
          placeholder="Who are you looking for?"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-[#181818] placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white text-base"
        />
      </div>

      {/* 🔍 ปุ่มค้นหา */}
      <button
        onClick={onSearch}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition cursor-pointer"
      >
        ค้นหา
      </button>
    </div>
  );
}

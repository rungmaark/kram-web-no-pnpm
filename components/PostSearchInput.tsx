// components/PostSearchInput.tsx

import { Search } from "lucide-react";

interface SearchInputProps {
  searchText: string;
  onSearchTextChange: (text: string) => void;
  onSearchSubmit?: () => void;
  className?: string;
}

export default function PostSearchInput({
  searchText,
  onSearchTextChange,
  onSearchSubmit,
  className = "",
}: SearchInputProps) {
  return (
    <div
      className={`flex w-full items-center gap-3 px-4 py-3 border border-[#2f3336] rounded-full bg-white dark:bg-[#181818] text-white ${className}`}
    >
      <Search className="text-[#71767b] w-5 h-5" />
      <input
        type="text"
        value={searchText}
        onChange={(e) => onSearchTextChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearchSubmit?.();
        }}
        placeholder="Search"
        className="bg-transparent outline-none text-black dark:text-white placeholder-gray-700 dark:placeholder-gray-50 w-full"
      />
    </div>
  );
}

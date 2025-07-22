// components/PostSearch.tsx

import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import PostSearchInput from "@/components/PostSearchInput";
import { careerOptions } from "@/lib/data/careerOptions";
import { locationSuggestions } from "@/public/data/locationSuggestions";

interface PostSearchBarProps {
  searchText: string;
  onSearchTextChange: (text: string) => void;
  onUniversitiesChange?: (uni: string[]) => void;
  onCareersChange?: (careers: string[]) => void;
  onProvincesChange?: (provinces: string[]) => void;
}

export default function PostSearch({
  searchText,
  onSearchTextChange,
  onUniversitiesChange,
  onCareersChange,
  onProvincesChange,
}: PostSearchBarProps) {
  const [Career] = useState(careerOptions.map((c) => c.label));
  const [Universities] = useState([
    "มหาวิทยาลัยศรีปทุม",
    "มหาวิทยาลัยหอการค้าไทย",
    "มหาวิทยาลัยเกษตรศาสตร์",
  ]);

  const [showCategories, setShowCategories] = useState(false);
  const [showCareer, setShowCareer] = useState(false);
  const [showUniversities, setShowUniversities] = useState(false);
  const [selectedCareers, setSelectedCareers] = useState<string[]>([]);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>(
    []
  );
  const [showProvince, setShowProvince] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string[]>([]);

  const toggleItem = (
    item: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>,
    isUniversity = false,
    isCareer = false,
    isProvince = false
  ) => {
    const newSelected = selected.includes(item)
      ? selected.filter((i) => i !== item)
      : [...selected, item];

    setSelected(newSelected);

    // ถ้าเป็นการ toggle มหาวิทยาลัย ให้ส่งออกไปข้างนอก
    if (isUniversity) {
      onUniversitiesChange?.(newSelected);
    }

    if (isCareer) {
      onCareersChange?.(newSelected);
    }

    if( isProvince) {
      onProvincesChange?.(newSelected);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search Box (hidden on mobile) */}
      <div className="hidden lg:flex shrink-0">
        <PostSearchInput
          searchText={searchText}
          onSearchTextChange={onSearchTextChange}
        />
      </div>

      {/* Scrollable area */}
      <div
        className="mt-4 flex-1 overflow-y-auto pr-2 pb-10 space-y-4 custom-scrollbar dark:custom-scrollbar.dark custom-scrollbar.light"
        style={{ maxHeight: "calc(100vh - 120px)" }}
      >
        {/* author by Career */}
        <div className="border border-gray-600 rounded-xl px-4 py-3">
          <div
            className={`flex items-center justify-between cursor-pointer ${
              showCareer ? "mb-2" : "mb-0"
            }`}
            onClick={() => setShowCareer(!showCareer)}
          >
            <h3 className="text-lg text-gray-800 dark:text-gray-100 font-bold select-none">
              Author By Career
            </h3>
            {showCareer ? (
              <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
          </div>
          <AnimatePresence initial={false}>
            {showCareer && (
              <motion.ul
                key="career"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden space-y-2"
              >
                {Career.map((item, index) => {
                  const selected = selectedCareers.includes(item);
                  return (
                    <li
                      key={index}
                      onClick={() =>
                        toggleItem(
                          item,
                          selectedCareers,
                          setSelectedCareers,
                          false /* isUniversity */,
                          true /* isCareer */
                        )
                      }
                      className={`px-2 py-1 rounded cursor-pointer select-none transition-colors
                      flex items-center ${
                        selected
                          ? "dark:text-white font-semibold border-l-4 border-orange-400"
                          : "text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#1d1f23]"
                      }`}
                    >
                      {item}
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* author by University */}
        <div className="border border-gray-600 rounded-xl px-4 py-3">
          <div
            className={`flex items-center justify-between cursor-pointer ${
              showUniversities ? "mb-2" : "mb-0"
            }`}
            onClick={() => setShowUniversities(!showUniversities)}
          >
            <h3 className="text-lg text-gray-800 dark:text-gray-100 font-bold select-none">
              Author By University
            </h3>
            {showUniversities ? (
              <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
          </div>
          <AnimatePresence initial={false}>
            {showUniversities && (
              <motion.ul
                key="university"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden space-y-2"
              >
                {Universities.map((item, index) => {
                  const selected = selectedUniversities.includes(item);
                  return (
                    <li
                      key={index}
                      onClick={() =>
                        toggleItem(
                          item,
                          selectedUniversities,
                          setSelectedUniversities,
                          true // คือ isUniversity = true
                        )
                      }
                      className={`px-2 py-1 rounded cursor-pointer select-none transition-colors
                      flex items-center ${
                        selected
                          ? "dark:text-white font-semibold border-l-4 border-orange-400"
                          : "text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#1d1f23]"
                      }`}
                    >
                      {item}
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* author by Province */}
        <div className="border border-gray-600 rounded-xl px-4 py-3">
          <div
            className={`flex items-center justify-between cursor-pointer ${
              showProvince ? "mb-2" : "mb-0"
            }`}
            onClick={() => setShowProvince(!showProvince)}
          >
            <h3 className="text-lg text-gray-800 dark:text-gray-100 font-bold select-none">
              Author By Province
            </h3>
            {showProvince ? (
              <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
          </div>
          <AnimatePresence initial={false}>
            {showProvince && (
              <motion.ul
                key="province"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden space-y-2"
              >
                {locationSuggestions.map((item, index) => {
                  const selected = selectedProvince.includes(item);
                  return (
                    <li
                      key={index}
                      onClick={() =>
                        toggleItem(
                          item,
                          selectedProvince,
                          setSelectedProvince,
                          true // คือ isProvince = true
                        )
                      }
                      className={`px-2 py-1 rounded cursor-pointer select-none transition-colors
                      flex items-center ${
                        selected
                          ? "dark:text-white font-semibold border-l-4 border-orange-400"
                          : "text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#1d1f23]"
                      }`}
                    >
                      {item}
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

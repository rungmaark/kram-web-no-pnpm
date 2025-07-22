// components/Interest.tsx
"use client";

type Interest = {
  interestName: string;
  category?: string; // จะมีหรือไม่มีก็ได้
};

type InterestProps = {
  interests: Interest[];
};

export default function Interest({ interests }: InterestProps) {
  const sorted = [...interests].sort((a, b) =>
    a.interestName.localeCompare(b.interestName, "th", {
      sensitivity: "base",
    })
  );

  if (sorted.length === 0) return null;

  return (
    <div className="max-w-[1160px] bg-white mt-1 py-5 px-5 dark:bg-black dark:text-gray-100 font-mono">
      <div className="flex flex-wrap gap-1.5">
        {sorted.map((interest) => (
          <div
            key={interest.interestName}
            className="bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900 dark:text-indigo-200 px-3 py-1 rounded-full border cursor-pointer flex items-center text-sm select-none transition-all"
          >
            {interest.interestName}
          </div>
        ))}
      </div>
    </div>
  );
}

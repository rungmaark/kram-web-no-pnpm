// components/Info.tsx

import {
  MapPin,
  Heart,
  PersonStanding,
  User,
  Gem,
  Flame,
  Cake,
} from "lucide-react";

type InfoProps = {
  currentCity: string | null;
  MBTI: string | null;
  relationshipStatus: string | null;
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  linkedin: string | null;
  careers?: string[];
  birthYear?: number | null;
};

function getMBTIColor(mbti: string): string {
  const upperMBTI = mbti.toUpperCase();
  if (["INTJ", "ENTJ", "INTP", "ENTP"].includes(upperMBTI))
    return "text-violet-500";
  if (["INFJ", "ENFJ", "INFP", "ENFP"].includes(upperMBTI))
    return "text-green-500";
  if (["ISTP", "ESTP", "ISFP", "ESFP"].includes(upperMBTI))
    return "text-blue-500";
  if (["ISTJ", "ESTJ", "ISFJ", "ESFJ"].includes(upperMBTI))
    return "text-yellow-500";
  return "text-gray-500"; // fallback
}

export default function Info({
  currentCity,
  MBTI,
  relationshipStatus,
  instagram,
  facebook,
  twitter,
  linkedin,
  careers,
  birthYear,
}: InfoProps) {
  const hasVisibleInfo =
    !!currentCity ||
    !!MBTI ||
    !!relationshipStatus ||
    !!instagram ||
    !!facebook ||
    !!twitter ||
    !!linkedin ||
    (careers && careers.length > 0);
  return (
    <div
      className={`${
        hasVisibleInfo ? "block" : "hidden"
      }w-full bg-white mt-1 py-5 px-5 dark:bg-black dark:text-gray-100 rounded-2xl shadow-sm`}
    >
      <div className="flex flex-col gap-5">
        {/* Section: Personal Info */}
        {(currentCity || MBTI || relationshipStatus || birthYear) && (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Personal Info
            </h2>

            {currentCity && (
              <div className="flex gap-2 items-center">
                <MapPin className="size-5" />
                <div className="font-semibold">{currentCity}</div>
              </div>
            )}

            {MBTI && (
              <div className="flex gap-2 items-center">
                <PersonStanding className="size-5" />
                <div className={`${getMBTIColor(MBTI)} font-bold`}>{MBTI}</div>
              </div>
            )}

            {relationshipStatus && (
              <div className="flex gap-2 items-center">
                {relationshipStatus === "single" && <User className="size-5" />}
                {relationshipStatus === "taken" && (
                  <Heart className="size-5 text-red-500" />
                )}
                {relationshipStatus === "married" && (
                  <Gem className="size-5 text-purple-500" />
                )}
                {relationshipStatus === "fwb" && (
                  <Flame className="size-5 text-orange-500" />
                )}
                <div className="font-semibold">{relationshipStatus}</div>
              </div>
            )}
            {birthYear && (
              <div className="flex gap-2 items-center">
                <Cake className="size-5" />
                <span className="font-bold">{birthYear}</span>
              </div>
            )}
          </div>
        )}

        {/* Section: Career */}
        {careers && careers.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Career
            </h2>
            <div className="flex flex-wrap gap-2">
              {careers.map((career, index) => (
                <span
                  key={index}
                  className="bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-white px-3 py-1 rounded-full text-sm font-semibold"
                >
                  {career}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Section: Social Media */}
        {(instagram || facebook || twitter || linkedin) && (
          <div className="flex flex-col gap-2 mt-3">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Contact
            </h2>

            {instagram && (
              <div className="flex">
                <a
                  href={`https://www.instagram.com/${instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <img
                    src="/image/instagram.png"
                    alt="Instagram"
                    className="w-5 h-5"
                  />
                  <div className="font-semibold">{instagram}</div>
                </a>
              </div>
            )}
            {facebook && (
              <div className="flex">
                <a className="flex items-center gap-2">
                  <img
                    src="/image/facebook.png"
                    alt="Facebook"
                    className="w-5 h-5"
                  />
                  <div className="font-semibold">{facebook}</div>
                </a>
              </div>
            )}
            {twitter && (
              <div className="flex">
                <a
                  href={`https://www.x.com/${twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <img
                    src="/image/twitter.png"
                    alt="Twitter"
                    className="w-5 h-5"
                  />
                  <div className="font-semibold">{twitter}</div>
                </a>
              </div>
            )}
            {linkedin && (
              <div className="flex">
                <a
                  href={`https://www.linkedin.com/in/${linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <img
                    src="/image/linkedin.png"
                    alt="LinkedIn"
                    className="w-5 h-5"
                  />
                  <div className="font-semibold">{linkedin}</div>
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

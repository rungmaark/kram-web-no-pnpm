// component/EditProfileModal.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import ContactPopup from "@/components/ContactPopup";
import DeepInfoButton from "@/components/DeepInfoButton";
import {
  CitySuggestion,
  fetchCitySuggestions,
} from "@/lib/fetchCitySuggestions";
import { SocialType } from "@/types/SocialType";
import DeepInfoPanel from "@/components/DeepInfoPanel";
import { useSession } from "next-auth/react";
import { useAuth } from "@/lib/auth-context";
import { SwalWithTheme } from "@/lib/swal";
import { getOwlImageByGender } from "@/lib/utils/avatar";

interface EditProfileModalProps {
  /* control & identity */
  onClose: () => void;
  onUpdateSuccess: (
    newDisplayName: string,
    newGender: string,
    newBio: string,
    newProfileImage: string | null
  ) => void;

  /* route / user info */
  username: string;
  userId: string | null;

  /* basic profile fields */
  displayName: string | null;
  gender: string | null;
  bio: string | null;
  profileImage: string | null;
  birthYear: number | null;

  /* socials */
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  linkedin: string | null;

  /* additional info */
  currentCity: string | null;
  MBTI: string | null;
  relationshipStatus: string | null;

  /* interests */
  interests: { interestName: string; category: string }[];
  rawProfileText: string | null;
}

function TabSwitcher({
  tabs,
  activeTab,
  setActiveTab,
}: {
  tabs: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  return (
    <div className="flex border-b dark:border-gray-500 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 -mb-px font-semibold transition-colors duration-200 ease-in-out ${activeTab === tab
            ? "border-b-2 border-indigo-600 text-indigo-600 cursor-pointer"
            : "text-gray-500 hover:text-indigo-600 cursor-pointer"
            }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function normalizeText(str: string) {
  return str.normalize("NFC").trim();
}

function toKey(value: string | null) {
  if (!value) return null;
  return value.startsWith("/api/image?key=")
    ? decodeURIComponent(value.split("key=")[1])
    : value;
}



export default function EditProfileModal({
  onClose,
  displayName: initialDisplayName,
  gender: initialGender,
  bio: initialBio,
  userId,
  instagram: initialInstagram,
  facebook: initialFacebook,
  twitter: initialTwitter,
  linkedin: initialLinkedIn,
  currentCity: initialCurrentCity,
  MBTI: initialMBTI,
  relationshipStatus: initialRelationshipStatus,
  interests,
  rawProfileText: initialRawProfileText,
  birthYear: initialBirthYear,
  profileImage: initialProfileImage,
  onUpdateSuccess,
}: EditProfileModalProps) {
  const { update: updateSession } = useSession();
  const { setUser } = useAuth();
  const [displayName, setDisplayName] = useState(initialDisplayName ?? "");
  const [gender, setGender] = useState(initialGender ?? "");
  const [bio, setBio] = useState(initialBio ?? "");
  const [relationshipStatus, setRelationshipStatus] = useState(
    initialRelationshipStatus ?? ""
  );
  const [selectedCity, setSelectedCity] = useState<CitySuggestion | null>(null);
  const [MBTI, setMBTI] = useState(initialMBTI ?? "");
  const [birthYear, setBirthYear] = useState(
    initialBirthYear ? initialBirthYear.toString() : ""
  );

  const [instagram, setInstagram] = useState(initialInstagram ?? "");
  const [facebook, setFacebook] = useState(initialFacebook ?? "");
  const [twitter, setTwitter] = useState(initialTwitter ?? "");
  const [linkedin, setLinkedIn] = useState(initialLinkedIn ?? "");
  const [socialList, setSocialList] = useState<SocialType[]>([]);
  const [loading, setLoading] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [openDeepInfo, setOpenDeepInfo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState(initialCurrentCity ?? "");
  const [activeTab, setActiveTab] = useState("Basic Info");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
    initialProfileImage ?? null
  );
  const [rawProfileText, setRawProfileText] = useState<string>("");
  const [interestsState, setInterestsState] = useState(interests);
  const currentYear = new Date().getFullYear();
  const rangeYears = [...Array(100)].map((_, i) => currentYear - i);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<
    CitySuggestion[]
  >([]);

  const locationDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const MIN_QUERY = 2;

  useEffect(() => {
    if (location.length < MIN_QUERY) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // ไม่ต้องล้าง suggestion แล้ว

    // ✅ ถ้าตรงกับ suggestion เดิมเป๊ะ ๆ → ไม่ต้อง fetch ใหม่
    if (locationSuggestions.some((s) => s.display === location)) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current);

    locationDebounceRef.current = setTimeout(async () => {
      const results = await fetchCitySuggestions(location);
      setLocationSuggestions(results);
      setShowSuggestions(results.length > 0); // ✅ มีข้อมูลค่อยโชว์
    }, 300); // debounce 300ms
  }, [location]);

  // ถ้า birthYear ไม่อยู่ใน list ให้เพิ่มไว้ด้วย
  if (birthYear && !rangeYears.includes(parseInt(birthYear.toString()))) {
    rangeYears.push(parseInt(birthYear.toString()));
    rangeYears.sort((a, b) => b - a); // เรียงใหม่จากมากไปน้อย
  }

  // 🔐 ตรงนี้เลย: decrypt ทันทีที่ mount modal
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/profile/raw", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("โหลดข้อมูลลึกไม่สำเร็จ");
        const { rawText, interests } = await res.json();
        setRawProfileText(rawText);
        setInterestsState(
          Array.isArray(interests)
            ? interests.map((i) => ({ interestName: i, category: "custom" }))
            : []
        );
      } catch (e: any) {
        console.error("decrypt rawProfileText error:", e);
      }
    })();
  }, []); // ทำครั้งเดียวตอน modal mount

  const handleDeepInfoSave = async () => {
    setOpenDeepInfo(false);
  };

  // ① ฟังชั่นเปิด DeepInfoPanel พร้อม decrypt
  async function openDeepInfoPanel() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/raw", { credentials: "include" });
      if (!res.ok) throw new Error("โหลดข้อมูลลึกไม่สำเร็จ");
      const { rawText: decrypted, interests } = await res.json();
      setRawProfileText(typeof decrypted === "string" ? decrypted : "");
      // interest เป็น string[] → แปลงเป็น shape เดิม
      setInterestsState(
        Array.isArray(interests)
          ? interests.map((i) => ({ interestName: i, category: "custom" }))
          : []
      );
      setOpenDeepInfo(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }



  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    /* ---------- ① อัปโหลดไฟล์หากเลือกใหม่ ---------- */
    let uploadedKey = toKey(initialProfileImage); // key ที่จะเก็บใน DB
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      /* 🔹สำคัญ! */
      uploadedKey = data.key; // <--- เก็บ key
      setImagePreviewUrl(data.url); // <--- ดูรูปทันที (proxy)
    }

    /* ---------- ② PATCH โปรไฟล์ ---------- */
    const res = await fetch("/api/auth/update-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        displayName,
        gender,
        bio,
        currentCity: selectedCity?.display || location.trim(),
        province: selectedCity?.province ?? "",
        country: selectedCity?.country ?? "",
        lat: selectedCity?.lat,
        lon: selectedCity?.lon,
        MBTI,
        relationshipStatus,
        instagram,
        facebook,
        twitter,
        linkedin,
        socialList,
        profileImage: uploadedKey,
        interests: interestsState,
        rawProfileText,
        birthYear:
          typeof birthYear === "string"
            ? parseInt(birthYear)
            : birthYear ?? null,
      }),
    });
    const result = await res.json();

    if (res.ok) {
      const updated = result.user;
      // 1. อัปเดต AuthContext
      setUser({
        userId: updated._id.toString(),
        username: updated.username,
        displayName: updated.displayName,
        profileImage: updated.profileImage ?? null,
        gender: updated.gender ?? null,
      });

      // 2. อัปเดต NextAuth session (broadcast ทุกแท็บ)
      await updateSession({
        displayName: updated.displayName,
        profileImage: updated.profileImage ?? null,
        gender: updated.gender ?? null,
      });

      SwalWithTheme.fire({
        icon: "success",
        title: "Profile updated!",
        timer: 1200,
        showConfirmButton: false,
        customClass: { popup: "dark" },
      });

      onUpdateSuccess(
        updated.displayName,
        updated.gender,
        updated.bio,
        updated.profileImage ?? null
      );

      onClose();
    } else {
      SwalWithTheme.fire({
        icon: "error",
        title: result.error || "Failed to update profile",
        customClass: {
          popup: "dark", // 👈 เพิ่ม class นี้ แล้วจัดการ style ใน global CSS
        },
      });
    }

    setLoading(false);
  };

  const addContact = (contact: SocialType) => {
    setSocialList((prevList) => {
      if (!prevList.some((item) => item.SocialMedia === contact.SocialMedia)) {
        return [...prevList, contact];
      }
      return prevList;
    });

    if (contact.SocialMedia === "instagram") setInstagram(contact.name);
    if (contact.SocialMedia === "facebook") setFacebook(contact.name);
    if (contact.SocialMedia === "twitter") setTwitter(contact.name);
    if (contact.SocialMedia === "linkedin") setLinkedIn(contact.name);
  };

  const handleDeleteInfo = async (
    type: "instagram" | "facebook" | "twitter" | "linkedin"
  ) => {
    const result = await SwalWithTheme.fire({
      title: `Delete ${type}`,
      text: `Remove your ${type} account?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      customClass: {
        popup: "dark", // 👈 เพิ่ม class นี้ แล้วจัดการ style ใน global CSS
      },
    });

    if (result.isConfirmed && userId) {
      const res = await fetch("/api/auth/remove-info", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type }),
      });

      const data = await res.json();

      if (res.ok) {
        if (type === "instagram") setInstagram("");
        if (type === "facebook") setFacebook("");
        if (type === "twitter") setTwitter("");
        if (type === "linkedin") setLinkedIn("");
      } else {
        SwalWithTheme.fire({
          title: "Error!",
          text: data.error || "Something went wrong",
          icon: "error",
          customClass: {
            popup: "dark", // 👈 เพิ่ม class นี้ แล้วจัดการ style ใน global CSS
          },
        });
      }
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Basic Info":
        return (
          <>
            <div className="flex flex-col items-center mb-4">
              <div className="relative w-28 h-28">
                <img
                  src={imagePreviewUrl || getOwlImageByGender(gender)}
                  alt="Preview"
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Click image to change
              </p>
            </div>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display Name"
              className="w-full p-2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-white mb-3"
            />
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-white mb-3"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="gay">Gay</option>
              <option value="lesbian">Lesbian</option>
              <option value="bisexual">Bisexual</option>
              <option value="transgender">Transgender</option>
            </select>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Bio"
              className="w-full p-2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-white mb-3 resize-none"
              rows={3}
            />
            <select
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              className="w-full p-2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-white mb-3"
            >
              <option value="">Select Year of Birth</option>
              {rangeYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </>
        );
      case "Preference":
        return (
          <>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Current City"
              className="w-full p-2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-white mb-1"
            />
            {showSuggestions && locationSuggestions.length > 0 && (
              <ul className="bg-zinc-100 dark:bg-zinc-800 rounded shadow max-h-60 mb-3 overflow-auto">
                {locationSuggestions.map((loc, i) => (
                  <li
                    key={i}
                    className="p-2 cursor-pointer text-zinc-800 dark:text-zinc-50 hover:bg-indigo-500 hover:text-white rounded"
                    onClick={() => {
                      setSelectedCity(loc); // เก็บ object ไว้ส่ง backend
                      setLocation(loc.display.replace(/,\s*$/, ""));
                      setShowSuggestions(false);
                    }}
                  >
                    {loc.display} {/* ✅ แสดงผลชื่อเต็ม */}
                  </li>
                ))}
              </ul>
            )}

            <label className="block mb-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
              MBTI
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                "ISTJ",
                "ISFJ",
                "INFJ",
                "INTJ",
                "ISTP",
                "ISFP",
                "INFP",
                "INTP",
                "ESTP",
                "ESFP",
                "ENFP",
                "ENTP",
                "ESTJ",
                "ESFJ",
                "ENFJ",
                "ENTJ",
              ].map((type) => (
                <button
                  key={type}
                  onClick={() => setMBTI(type)}
                  className={`p-2 rounded ${MBTI === type
                    ? "bg-indigo-500 text-white"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-white"
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <select
              value={relationshipStatus}
              onChange={(e) => setRelationshipStatus(e.target.value)}
              className="w-full p-2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-white mb-3"
            >
              <option value="">Relationship Status</option>
              <option value="single">Single</option>
              <option value="taken">Taken</option>
              <option value="married">Married</option>
              <option value="fwb">FWB</option>
            </select>
          </>
        );
      case "Social":
        return (
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Instagram", value: instagram },
              { label: "Facebook", value: facebook },
              { label: "Twitter", value: twitter },
              { label: "LinkedIn", value: linkedin },
            ].map(
              (s) =>
                s.value && (
                  <div
                    key={s.label}
                    className="flex items-center gap-2 p-2 bg-zinc-200 dark:bg-zinc-700 rounded"
                  >
                    <img
                      src={`/image/${s.label.toLowerCase()}.png`}
                      alt={s.label}
                      className="w-5 h-5"
                    />
                    <span className="font-semibold dark:text-gray-50">
                      {s.value}
                    </span>
                    <button
                      className="text-red-500 cursor-pointer"
                      onClick={() =>
                        handleDeleteInfo(s.label.toLowerCase() as any)
                      }
                    >
                      ✕
                    </button>
                  </div>
                )
            )}
            <ContactPopup
              open={contactOpen}
              onOpenChange={setContactOpen}
              onAddContact={(contact) => {
                addContact(contact);
                setContactOpen(false);
              }}
            />
          </div>
        );
      case "Deep Info":
        return (
          <>
            <div className="flex">
              <DeepInfoButton onOpen={openDeepInfoPanel} />
            </div>

            <DeepInfoPanel
              open={openDeepInfo}
              onClose={() => setOpenDeepInfo(false)}
              onSave={handleDeepInfoSave}
              defaultRawText={rawProfileText}
              defaultInterests={interestsState.map(i => i.interestName)}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl w-full max-w-2xl h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-center text-zinc-800 dark:text-white mb-4">
          Edit Profile
        </h2>

        <TabSwitcher
          tabs={["Basic Info", "Preference", "Social", "Deep Info"]}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <div>{renderTabContent()}</div>

        {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}

        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 bg-zinc-300 text-gray-700 rounded hover:bg-zinc-200 cursor-pointer"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

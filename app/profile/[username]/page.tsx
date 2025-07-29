// app/profile/[username]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from 'next-auth/react';
import Navbar from "@/components/Navbar";
import Interest from "@/components/Interest";
import Info from "@/components/Info";
import { Inter } from "next/font/google";
import EditProfileModal from "@/components/EditProfileModal";
import { Mars, Venus } from "lucide-react";
import { PostData } from "@/types/Post";
import "@/models/Comment";
import UserPostList from "@/components/๊๊UserPostList";
import FollowListModal from "@/components/FollowListModal";


// If loading a variable font, you don't need to specify the font weight
const inter = Inter({ subsets: ["latin"] });

type User = {
  id: string;
  displayName: string;
};

export default function Profile() {
  const { username } = useParams() as { username: string };
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [instagram, setInstagram] = useState<string | null>(null);
  const [facebook, setFacebook] = useState<string | null>(null);
  const [twitter, setTwitter] = useState<string | null>(null);
  const [LinkedIn, setLinkedIn] = useState<string | null>(null);
  const [currentCity, setCurrentCity] = useState<string | null>(null);
  const [MBTI, setMBTI] = useState<string | null>(null);
  const [relationshipStatus, setRelationshipStatus] = useState<string | null>(
    null
  );
  const [interests, setInterests] = useState<any[]>([]);
  const [rawProfileText, setRawProfileText] = useState<string | null>(null);
  const [careers, setCareers] = useState<string[]>([]);
  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [activeTab, setActiveTab] = useState("Interest");
  const [user, setUser] = useState<User | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [userExists, setUserExists] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const router = useRouter();
  const [showModal, setShowModal] = useState<"followers" | "following" | null>(
    null
  );

  const { data: session, status } = useSession();

  // 1) โหลด profileId โดยใช้ username
  useEffect(() => {
    fetch(`/api/user-by-username?username=${username}`)
      .then(res => {
        if (res.status === 404) {
          router.replace('/profile');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data?._id) setProfileId(data._id);
      });
  }, [username, router]);

  // 2) รอ session พร้อม แล้วเช็ค isOwner
  useEffect(() => {
    if (status !== 'authenticated' || !profileId) return;
    // session.user.id มาจาก callback ใน authOptions
    setIsOwner(session.user.id === profileId);
  }, [status, session, profileId]);


  // ดึงค่า decrypted rawProfileText ทันทีที่เปิด modal
  useEffect(() => {
    if (!isEditModalOpen) return;
    (async () => {
      try {
        const res = await fetch("/api/profile/raw", { credentials: "include" });
        if (!res.ok) throw new Error("โหลดข้อมูลลึกไม่สำเร็จ");
        const { rawText } = await res.json();
        setRawProfileText(rawText);
      } catch (e: any) {
        console.error("decrypt rawProfileText error:", e);
      }
    })();
  }, [isEditModalOpen])

  useEffect(() => {
    async function fetchSession() {
      const res = await fetch("/api/auth/session", { credentials: "include" });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      }
    }

    async function fetchProfileId() {
      const res = await fetch(`/api/user-by-username?username=${username}`);
      const data = await res.json();

      if (res.status === 404) {
        setUserExists(false);
        router.push("/profile");
        return;
      }

      setProfileId(data._id);
      setDisplayName(data.displayName);
      setGender(data.gender);
      setBio(data.bio);
      setInstagram(data.instagram);
      setFacebook(data.facebook);
      setTwitter(data.twitter);
      setLinkedIn(data.linkedin);
      setCurrentCity(data.currentCity);
      setMBTI(data.MBTI);
      setRelationshipStatus(data.relationshipStatus);
      setInterests(data.interests);
      setCareers(data.careers || []);
      setBirthYear(data.birthYear ?? null);
      setProfileImage(
        data.profileImage
          ? `/api/image?key=${encodeURIComponent(data.profileImage)}`
          : null
      );

      const postRes = await fetch(`/api/auth/post/by-user?userId=${data._id}`);
      const postJson = await postRes.json();
      setPosts(postJson.posts);
    }

    fetchSession();
    fetchProfileId();
  }, [username, router]);

  useEffect(() => {
    if (user && profileId) {
      setIsOwner(user.id === profileId);
    }
  }, [user, profileId]);

  useEffect(() => {
    async function fetchFollowInfo() {
      if (!profileId) return;

      try {
        const res = await fetch(
          `/api/auth/follow/status?profileId=${profileId}`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          console.warn("Failed to fetch follow status");
          return;
        }

        const data = await res.json();
        setIsFollowing(data.isFollowing);
        setFollowerCount(data.followerCount);
        setFollowingCount(data.followingCount);
      } catch (err) {
        console.error("Error fetching follow status:", err);
      }
    }
    fetchFollowInfo();
  }, [profileId]);

  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams?.get("editProfile") === "1") {
      setIsEditModalOpen(true); // เปิด modal อัตโนมัติ
    }
  }, [searchParams]);

  if (!userExists) {
    return null;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "Post":
        return profileId ? <UserPostList userId={profileId} /> : null;

      case "Info":
        return (
          <Info
            currentCity={currentCity}
            instagram={instagram}
            facebook={facebook}
            twitter={twitter}
            linkedin={LinkedIn}
            MBTI={MBTI}
            relationshipStatus={relationshipStatus}
            birthYear={birthYear}
          />
        );
      default:
        return <Interest interests={interests || []} />;
    }
  };

  const copyToClipboard = (text: string) => {
    if (
      navigator?.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      return navigator.clipboard.writeText(text);
    } else {
      // fallback สำหรับ browser เก่า
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed"; // ป้องกันการ scroll jump
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
      } catch (err) {
        console.error("Fallback: Oops, unable to copy", err);
      }
      document.body.removeChild(textArea);
      return Promise.resolve();
    }
  };

  function getOwlImageByGender(gender: string | null): string {
    switch (gender?.toLowerCase()) {
      case "male":
        return "/image/blue-owl.png";
      case "female":
        return "/image/pink-owl.png";
      case "gay":
        return "/image/green-owl.png";
      case "lesbian":
        return "/image/purple-owl.png";
      case "transgender":
        return "/image/red-owl.png";
      case "bisexual":
        return "/image/yellow-owl.png";
      default:
        return "/image/gray-owl.png";
    }
  }

  function GenderIcon({ gender }: { gender: string | null }) {
    if (gender === "male") {
      return <Mars size={20} className="inline-block text-blue-400" />;
    } else if (gender === "female") {
      return <Venus size={20} className="inline-block text-pink-400" />;
    } else if (gender === "gay") {
      return <img src="/image/gay.png" className="size-6 inline" />;
    } else if (gender === "lesbian") {
      return <img src="/image/lesbian.png" className="size-5 inline" />;
    } else if (gender === "bisexual") {
      return <img src="/image/bisexual.png" className="size-5 inline" />;
    } else if (gender === "transgender") {
      return <img src="/image/transgender.png" className="size-5 inline" />;
    } else {
      return null;
    }
  }

  return (
    <div
      className={`min-h-screen lg:px-10 xl:px-50 bg-gray-100 dark:bg-midnight ${isEditModalOpen ? "h-screen overflow-hidden" : ""
        }`}
    >
      {isEditModalOpen ? null : <Navbar />}
      <div className="">
        <div className="flex justify-center lg:gap-1">
          <div
            className={`${isEditModalOpen ? "hidden" : "flex"
              } profile-con w-full max-w-[1160px] flex-col mt-5 pb-5 rounded rounded-lg`}
          >
            <div className="flex flex-col bg-white dark:bg-black pt-5">
              <div className="flex px-5 sm:px-10 mb-10 flex-wrap lg:flex-nowrap">
                <div
                  className={`flex flex-col ${isEditModalOpen ? "hidden" : ""
                    } mr-6 mb-4 lg:mb-0`}
                >
                  <img
                    src={profileImage || getOwlImageByGender(gender)}
                    className="w-28 h-28 rounded-full object-center object-cover"
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="text-2xl font-semibold dark:text-gray-100 break-words">
                    {displayName ? displayName : "Loading..."}
                  </div>
                  <div className="text-sm font-semibold opacity-70 dark:text-gray-100 dark:opacity-80 break-words">
                    <GenderIcon gender={gender} /> @{username}
                  </div>
                  {bio && (
                    <div className="max-w-100 text-sm font-semibold opacity-70 dark:text-gray-100 dark:opacity-80 mt-2 break-words">
                      {bio}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between pl-2 sm:pl-5 sm:pl-10">
                <div className="flex gap-3 dark:text-gray-50">
                  <div
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => setShowModal("followers")}
                  >
                    <div className="text-xs sm:text-sm opacity-70">
                      {followerCount}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold">
                      Followers
                    </div>
                  </div>
                  <div
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => setShowModal("following")}
                  >
                    <div className="text-xs sm:text-sm opacity-70">
                      {followingCount}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold">
                      Following
                    </div>
                  </div>
                </div>

                {isOwner ? (
                  <div className="flex gap-2 sm:mr-2.5">
                    <button
                      className="border border-black text-black text-xs sm:text-sm px-4 py-2 rounded-full font-semibold transition-colors dark:border-white dark:text-white cursor-pointer"
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      Edit Profile
                    </button>
                    <button
                      className="border border-black text-black text-xs sm:text-sm px-4 py-2 rounded-full font-semibold transition-colors dark:border-white dark:text-white cursor-pointer"
                      onClick={async () => {
                        try {
                          await copyToClipboard(window.location.href);
                          setCopySuccess(true);
                          setTimeout(() => setCopySuccess(false), 2000);
                        } catch (err) {
                          console.error("Failed to copy: ", err);
                          alert("Failed to copy link 😢");
                        }
                      }}
                    >
                      {copySuccess ? "Copied!" : "Share Profile"}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 mr-2.5">
                    <button
                      className={`${isFollowing
                        ? "bg-gray-100 text-gray-700 dark:text-gray-50 dark:bg-gray-800"
                        : "bg-indigo-400 text-gray-50 dark:bg-indigo-500"
                        } px-4 py-2 rounded-md font-semibold hover:opacity-80 transition-colors duration-200 cursor-pointer`}
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/auth/follow/toggle", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ targetUserId: profileId }),
                            credentials: "include",
                          });

                          if (!res.ok) {
                            console.warn("Failed to toggle follow");
                            return;
                          }

                          const data = await res.json();
                          setIsFollowing(data.isFollowing);
                          setFollowerCount(data.followerCount);
                        } catch (err) {
                          console.error("Error toggling follow:", err);
                        }
                      }}
                    >
                      {isFollowing ? "Unfollow" : "Follow"}
                    </button>

                    {profileId && (
                      <button
                        onClick={() =>
                          router.push(`/message?userId=${profileId}`)
                        }
                        className="bg-gray-100 dark:bg-gray-800 dark:text-gray-50 px-4 py-2 rounded-md font-semibold cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        Message
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-1.5 mt-10">
                {["Interest", "Post", "Info"].map((tab) => (
                  <div
                    key={tab}
                    className={`border-b-2 px-4 font-semibold cursor-pointer transition-colors duration-200 ${activeTab === tab
                      ? "border-black text-black dark:text-gray-50 dark:border-gray-50"
                      : "border-gray-400 text-gray-400 dark:text-gray-500 dark:border-gray-500"
                      }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </div>
                ))}
              </div>
            </div>
            <div>{renderTabContent()}</div>
            <div
              className={`${isEditModalOpen ? "hidden" : ""} lg:hidden block`}
            ></div>
          </div>
        </div>
      </div>

      {/* Modal Popup */}
      {isEditModalOpen && (
        <EditProfileModal
          onClose={() => setIsEditModalOpen(false)}
          username={username}
          displayName={displayName}
          gender={gender}
          bio={bio}
          userId={profileId}
          instagram={instagram}
          facebook={facebook}
          twitter={twitter}
          linkedin={LinkedIn}
          currentCity={currentCity}
          MBTI={MBTI}
          relationshipStatus={relationshipStatus}
          interests={interests}
          rawProfileText={rawProfileText}
          birthYear={birthYear}
          profileImage={profileImage}
          onUpdateSuccess={(
            newDisplayName: string,
            newGender: string,
            newBio: string,
            newProfileImage: string | null
          ) => {
            setDisplayName(newDisplayName);
            setGender(newGender);
            setBio(newBio);
            setInstagram(instagram);
            setFacebook(facebook);
            setTwitter(twitter);
            setLinkedIn(LinkedIn);
            setCurrentCity(currentCity);
            setMBTI(MBTI);
            setRelationshipStatus(relationshipStatus);
            const proxyUrl = newProfileImage
              ? `/api/image?key=${encodeURIComponent(newProfileImage)}`
              : null;
            setProfileImage(proxyUrl);
          }}
        />
      )}

      {showModal && profileId && (
        <FollowListModal
          type={showModal}
          userId={profileId}
          onClose={() => setShowModal(null)}
        />
      )}
    </div>
  );
}

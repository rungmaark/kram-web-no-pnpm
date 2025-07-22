import { useState } from "react";
import { Plus, X, ChevronDown } from "lucide-react";
import { SocialType } from "@/types/SocialType";
import { SocialMediaPlatform } from "@/types/SocialType";

export default function ContactPopup({
  open,
  onOpenChange,
  onAddContact,
}: {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddContact: (name: SocialType) => void;
}) {
  const [isOpenContactForm, setIsOpenContactForm] = useState(false);
  const [SocialMedia, setSocialMedia] = useState("");
  const [inputValue, setInputValue] = useState("");

  const toSocialMediaPlatform = (media: string): SocialMediaPlatform | null => {
    const lower = media.toLowerCase();
    if (["instagram", "facebook", "twitter", "linkedin"].includes(lower)) {
      return lower as SocialMediaPlatform;
    }
    return null;
  };

  const handleSocialMediaClick = (media: string) => {
    setSocialMedia(media);
    setIsOpenContactForm(true);
  };

  const handleAdd = () => {
    const platform = toSocialMediaPlatform(SocialMedia);
    if (platform && inputValue) {
      onAddContact({ SocialMedia: platform, name: inputValue });
      setInputValue("");
      setIsOpenContactForm(false);
      onOpenChange(false);
    }
  };

  return (
    <div className="relative flex items-center">
      {/* Plus Button */}
      <button
        className="bg-indigo-500 text-white p-1.25 rounded shadow-lg hover:bg-indigo-700 transition-all cursor-pointer"
        onClick={() => onOpenChange(true)}
      >
        <Plus size={20} />
      </button>

      {/* Contact Popup */}
      {open && (
        <div className="bg-indigo-600 dark:bg-indigo-800 fixed inset-0 flex items-center justify-center bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl w-80 w-200 h-145">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Contacts
              </h2>
              <button
                onClick={() => onOpenChange(false)}
                className="text-gray-600 dark:text-white"
              >
                <X size={24} className="cursor-pointer" />
              </button>
            </div>
            <div>
              {["Instagram", "Facebook", "Twitter", "LinkedIn"].map((media) => (
                <div
                  key={media}
                  className="flex justify-between items-center border-b border-white dark:border-gray-700 bg-gray-100 dark:bg-gray-800 w-full h-10 px-2 py-5.5 cursor-pointer"
                  onClick={() => handleSocialMediaClick(media)}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={`/image/${media.toLowerCase()}.png`}
                      alt=""
                      className="w-5 h-5"
                    />
                    <div className="font-semibold text-gray-800 dark:text-gray-100">
                      {media}
                    </div>
                  </div>
                  <ChevronDown className="text-gray-100" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contact Form */}
      {isOpenContactForm && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 px-5 pt-5 pb-3 rounded-lg shadow-xl w-100 border dark:border-gray-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Your {SocialMedia}
              </h2>
              <button
                onClick={() => setIsOpenContactForm(false)}
                className="text-gray-600 dark:text-white"
              >
                <X size={24} className="cursor-pointer" />
              </button>
            </div>
            <input
              type="text"
              placeholder={`Your ${SocialMedia}`}
              onChange={(e) => setInputValue(e.target.value)}
              value={inputValue}
              className="block border dark:border-gray-50 dark:placeholder-gray-400 dark:text-gray-50 w-full h-5 px-2.5 py-5"
            />
            <div className="flex w-full justify-end">
              <button
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1.5 rounded shadow-lg cursor-pointer mt-4 transition-all"
                onClick={handleAdd}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

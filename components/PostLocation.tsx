// components/PostLocation.tsx
import { MapPin } from "lucide-react";

export default function PostLocation({ location }: { location?: string }) {
  if (!location) return null;

  return (
    <div className="flex items-center gap-1 mt-0.5 text-sm text-gray-500 dark:text-gray-400">
      <MapPin className="w-4 h-4" />
      <span>{location}</span>
    </div>
  );
}

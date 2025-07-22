// lib/utils/avatar.ts

export function getOwlImageByGender(gender?: string): string {
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

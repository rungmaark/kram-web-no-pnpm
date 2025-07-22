// lib/swal.ts
import Swal from "sweetalert2";

const isDark = () => {
  if (typeof window === "undefined") return false;
  return document.documentElement.classList.contains("dark");
};

export const SwalWithTheme = Swal.mixin({
  customClass: {
    popup: isDark() ? "dark" : "", // 👈 ถ้าใช้ dark mode ก็เพิ่ม class "dark"
  },
});

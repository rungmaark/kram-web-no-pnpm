// lib/auth-context.ts
import { createContext, useContext } from "react";
import type { MinimalUser } from "@/types/User";

export const AuthContext = createContext<{
  user: MinimalUser | null;
  setUser: (u: MinimalUser | null) => void;
}>({ user: null, setUser: () => {} });
export const useAuth = () => useContext(AuthContext);

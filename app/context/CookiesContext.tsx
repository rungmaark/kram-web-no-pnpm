// app/context/CookiesContext.tsx
'use client';

import React, { createContext, useContext, ReactNode } from "react";

// สร้าง Context สำหรับ cookies
const CookiesContext = createContext<any>(null);

export const CookiesProvider = ({ children, userId, username }: { children: ReactNode, userId: string, username: string }) => {
  return (
    <CookiesContext.Provider value={{ userId, username }}>
      {children}
    </CookiesContext.Provider>
  );
};

// ใช้ Context ในส่วนอื่น ๆ ของแอป
export const useCookies = () => useContext(CookiesContext);

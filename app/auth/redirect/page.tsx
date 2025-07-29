// app/auth/redirect/page.tsx
'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OAuthRedirect() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    // เรียก API เช็ค 3 กรณี (server-side session)
    fetch('/api/auth/check-google-user')
      .then(res => res.json())
      .then(data => {
        switch (data.case) {
          case 'existing':
          case 'created':
            router.replace(`/profile/${data.username}`);
            break;
          case 'conflict':
            router.replace('/complete-profile');
            break;
          default:
            router.replace('/signin');
        }
      })
      .catch(() => {
        router.replace('/signin');
      });
  }, [status, router]);

  return <div className="flex items-center justify-center h-screen">กำลังตรวจสอบ…</div>;
}

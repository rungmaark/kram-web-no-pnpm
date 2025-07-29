// app/complete-profile/page.tsx
'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function CompleteProfile() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (status === 'loading') return;
        if (status === 'unauthenticated' || !session?.user?.email) {
            router.replace('/signin');
        }
    }, [status, session, router]);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        const res = await fetch('/api/auth/update-username', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        });
        const data = await res.json();
        if (!res.ok) return setError(data.error || 'Error');
        router.replace(`/profile/${username}`);
    };

    return (
        <form onSubmit={onSubmit} className="max-w-sm mx-auto p-4">
            <h2 className="text-xl mb-4">เลือก Username</h2>
            <input
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().trim())}
                className="w-full p-2 border mb-2"
                placeholder="username"
            />
            {error && <p className="text-red-500">{error}</p>}
            <button type="submit" className="mt-2 w-full bg-indigo-600 text-white p-2">
                Save
            </button>
        </form>
    );
}

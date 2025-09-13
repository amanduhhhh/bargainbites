'use client';

import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';

export default function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="h-6 w-20 rounded-full bg-black/10 animate-pulse" />
    );
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn('google')}
        className="rounded-full border border-black/10 px-4 py-1.5 hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white text-sm transition-colors duration-200 ease-in-out"
      >
        Log in
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/profile" className="text-sm hover:underline underline-offset-4">
        {session.user?.name || session.user?.email || 'Profile'}
      </Link>
    </div>
  );
}

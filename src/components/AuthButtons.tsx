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
      <Link
        href="/profile"
        className="w-6 h-6 rounded-full bg-loblaws-orange flex items-center justify-center hover:bg-loblaws-orange/80 transition-colors"
      >
        <svg
          className="w-5 h-5 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
      </Link>
    </div>
  );
}

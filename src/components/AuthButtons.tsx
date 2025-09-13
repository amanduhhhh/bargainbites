'use client';

import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0';

export default function AuthButtons() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="h-6 w-20 rounded-full bg-black/10 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="rounded-full border border-black/10 px-4 py-1.5 hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white text-sm transition-colors duration-200 ease-in-out"
      >
        Log in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/profile" className="text-sm hover:underline underline-offset-4">
        {user.name || user.email || 'Profile'}
      </Link>
      <Link
        href="/auth/logout"
        className="rounded-full border border-black/10 px-4 py-1.5 hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white text-sm transition-colors duration-200 ease-in-out"
      >
        Log out
      </Link>
    </div>
  );
}

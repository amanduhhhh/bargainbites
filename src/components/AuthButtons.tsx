'use client';

import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { User } from 'lucide-react';

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
        <User className="w-5 h-5 text-white" />
      </Link>
    </div>
  );
}

'use client';

import { useUser } from '@auth0/nextjs-auth0';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isLoading, error } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-sm text-black/60 dark:text-white/60">Loading profile…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen grid place-items-center text-red-600">{error.message}</div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center">
          <p className="mb-4">You need to log in to view your profile.</p>
          <Link href="/auth/login" className="rounded-full border border-black/10 px-4 py-1.5 hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] text-sm">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
      <div className="mt-6 rounded-lg border border-black/10 p-5">
        <div className="flex items-center gap-4">
          {user.picture && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.picture} alt="avatar" className="h-14 w-14 rounded-full border border-black/10 object-cover" />
          )}
          <div>
            <div className="text-lg font-medium">{user.name || user.nickname || user.email}</div>
            {user.email && <div className="text-sm text-black/60 dark:text-white/60">{user.email}</div>}
            {user.sub && <div className="text-xs text-black/50 dark:text-white/50 mt-1">ID: {user.sub}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

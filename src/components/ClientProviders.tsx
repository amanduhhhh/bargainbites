'use client';

import { Auth0Provider as UserProvider } from '@auth0/nextjs-auth0';
import type { ReactNode } from 'react';

export default function ClientProviders({ children }: { children: ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}

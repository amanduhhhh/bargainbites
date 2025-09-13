'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function RouteLoader() {
  const pathname = usePathname();
  const first = useRef(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 100);
    return () => clearTimeout(t);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/50">
      <div
        aria-label="Loading"
        className="h-5 w-5 animate-spin rounded-full border border-black/20 border-t-black"
      />
    </div>
  );
}

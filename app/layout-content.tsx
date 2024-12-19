'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/navbar';

interface LayoutContentProps {
  children: ReactNode;
}

export function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname();
  const isViewPage = pathname?.startsWith('/view');

  return (
    <>
      {!isViewPage && <Navbar />}
      {children}
    </>
  );
}


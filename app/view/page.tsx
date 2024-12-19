'use client';

import React, { Suspense } from 'react';
import ManhwaViewer from '@/components/manhwa-viewer';

export default function ViewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ManhwaViewer />
    </Suspense>
  );
}


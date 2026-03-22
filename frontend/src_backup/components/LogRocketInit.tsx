'use client';

import { useEffect } from 'react';
import LogRocket from 'logrocket';

export default function LogRocketInit() {
  useEffect(() => {
    const logrocketId = process.env.NEXT_PUBLIC_LOGROCKET_ID;
    if (logrocketId && typeof window !== 'undefined') {
      LogRocket.init(logrocketId);
    }
  }, []);

  return null; // This component handles initialization silently without rendering DOM nodes
}

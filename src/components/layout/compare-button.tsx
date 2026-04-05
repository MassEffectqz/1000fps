'use client';

import Link from 'next/link';
import { useCompare } from '@/lib/context/compare-context';

export function CompareButton() {
  const { getCompareCount } = useCompare();
  const count = getCompareCount();

  return (
    <Link href="/compare" className="hbtn" title="Сравнение">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
      <span className="hbtn__label">Сравнить</span>
      {count > 0 && (
        <span className="hbtn__badge">{Math.min(count, 5)}</span>
      )}
    </Link>
  );
}

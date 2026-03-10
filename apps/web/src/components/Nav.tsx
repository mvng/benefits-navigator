'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DEMO_MODE } from '@/lib/demo-data';

const links = [
  { href: '/', label: 'Home' },
  { href: '/quiz', label: 'Quiz' },
  { href: '/results', label: 'Results' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/chat', label: 'AI Chat' },
  { href: '/apply/calfresh', label: 'Apply' },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <>
      {DEMO_MODE && (
        <div className="bg-amber-400 px-4 py-2 text-center text-xs font-semibold text-amber-900">
          🚧 Demo Mode — sample data only, no backend required
        </div>
      )}
      <nav className="border-b border-gray-200 bg-white px-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between py-3">
          <Link href="/" className="text-sm font-bold text-brand-700">
            🧭 Benefits Navigator
          </Link>
          <div className="flex gap-1">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  pathname === href
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}

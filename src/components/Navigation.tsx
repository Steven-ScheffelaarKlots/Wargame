"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();
  
  return (
    <header className="w-full flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 mb-6">
      <Link href="/" className="text-2xl sm:text-3xl font-bold hover:text-amber-600 transition-colors">
        Warhammer Hub
      </Link>
      <nav className="flex gap-6">
        <Link 
          href="/" 
          className={`font-medium transition-colors ${
            pathname === "/" 
              ? "text-amber-600" 
              : "hover:text-amber-600"
          }`}
        >
          Home
        </Link>
        <Link 
          href="/scoreboard" 
          className={`font-medium transition-colors ${
            pathname.startsWith("/scoreboard") 
              ? "text-amber-600" 
              : "hover:text-amber-600"
          }`}
        >
          Scoreboard
        </Link>
      </nav>
    </header>
  );
}

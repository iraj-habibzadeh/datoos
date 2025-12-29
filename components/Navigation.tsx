'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import WalletConnect from './WalletConnect';
import ThemeSwitcher from './ThemeSwitcher';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-white dark:bg-gray-800 green-mode:bg-green-50 border-b border-gray-200 dark:border-gray-700 green-mode:border-green-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white green-mode:text-green-900">
              Crypto Exchange
            </Link>
            <div className="flex space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'bg-blue-100 dark:bg-blue-900 green-mode:bg-green-200 text-blue-700 dark:text-blue-300 green-mode:text-green-800'
                    : 'text-gray-700 dark:text-gray-300 green-mode:text-green-700 hover:bg-gray-100 dark:hover:bg-gray-700 green-mode:hover:bg-green-100'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/profile')
                    ? 'bg-blue-100 dark:bg-blue-900 green-mode:bg-green-200 text-blue-700 dark:text-blue-300 green-mode:text-green-800'
                    : 'text-gray-700 dark:text-gray-300 green-mode:text-green-700 hover:bg-gray-100 dark:hover:bg-gray-700 green-mode:hover:bg-green-100'
                }`}
              >
                Profile
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <WalletConnect />
          </div>
        </div>
      </div>
    </nav>
  );
}


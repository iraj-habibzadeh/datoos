'use client';

import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  const themes = [
    { value: 'light' as const, label: 'Light', icon: '☀️' },
    { value: 'dark' as const, label: 'Dark', icon: '🌙' },
    { value: 'green' as const, label: 'Green', icon: '🌿' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 green-mode:bg-green-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 green-mode:hover:bg-green-200 transition-colors"
        aria-label="Theme switcher"
      >
        <span className="text-lg">
          {themes.find((t) => t.value === theme)?.icon || '☀️'}
        </span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 green-mode:text-green-800 hidden sm:inline">
          {themes.find((t) => t.value === theme)?.label || 'Light'}
        </span>
      </button>
      {showMenu && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 green-mode:bg-green-50 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 green-mode:border-green-200 z-50">
          <div className="p-2">
            {themes.map((themeOption) => (
              <button
                key={themeOption.value}
                onClick={() => {
                  setTheme(themeOption.value);
                  setShowMenu(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded transition-colors flex items-center gap-2 ${
                  theme === themeOption.value
                    ? 'bg-blue-100 dark:bg-blue-900 green-mode:bg-green-200 text-blue-700 dark:text-blue-300 green-mode:text-green-800 font-medium'
                    : 'text-gray-700 dark:text-gray-300 green-mode:text-green-700 hover:bg-gray-100 dark:hover:bg-gray-700 green-mode:hover:bg-green-100'
                }`}
              >
                <span>{themeOption.icon}</span>
                <span>{themeOption.label}</span>
                {theme === themeOption.value && (
                  <span className="ml-auto">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


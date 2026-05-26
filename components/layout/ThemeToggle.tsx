'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // Sync state with HTML class on mount
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center p-2 rounded-full text-[#78756F] dark:text-[#9E9C97] hover:bg-[#F0EFE9] dark:hover:bg-[#242321] transition-all hover:scale-105 active:scale-95"
      aria-label="Toggle Theme"
      title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {/* Sun Icon */}
        <div
          className={`absolute transition-all duration-300 transform ${
            dark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
          }`}
        >
          <Sun size={18} />
        </div>
        {/* Moon Icon */}
        <div
          className={`absolute transition-all duration-300 transform ${
            dark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
          }`}
        >
          <Moon size={18} />
        </div>
      </div>
    </button>
  );
}

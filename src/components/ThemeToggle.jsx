import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Switch between Dark and Light theme"
      title={
        isDark
          ? 'Active: Dark Theme (Light screen, dark text, dark buttons). Click to switch to Light Theme.'
          : 'Active: Light Theme (Dark screen, light text, light buttons). Click to switch to Dark Theme.'
      }
      className={`px-3 py-1.5 rounded-xl text-xs font-black tracking-wide flex items-center gap-2 border shadow-sm transition-all duration-200 cursor-pointer ${
        isDark
          ? 'bg-[#141824] text-white border-slate-900 hover:bg-slate-800'
          : 'bg-white text-[#141824] border-slate-200 hover:bg-slate-100'
      }`}
    >
      {isDark ? (
        <>
          <Moon size={14} className="text-amber-400 shrink-0" />
          <span>Dark Theme</span>
          <span className="text-[10px] font-bold text-slate-300 ml-0.5 bg-slate-800 px-1.5 py-0.5 rounded">
            Light Screen
          </span>
        </>
      ) : (
        <>
          <Sun size={14} className="text-amber-500 shrink-0" />
          <span>Light Theme</span>
          <span className="text-[10px] font-bold text-slate-600 ml-0.5 bg-slate-100 px-1.5 py-0.5 rounded">
            Dark Screen
          </span>
        </>
      )}
    </button>
  );
};

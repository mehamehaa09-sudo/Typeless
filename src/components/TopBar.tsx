import React, { useEffect, useRef, useState } from 'react';
import { ACCENT_COLORS, LANGUAGES } from '../constants';
import { ThemeMode } from '../types';

interface TopBarProps {
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  accentColor: string;
  onSelectAccentColor: (color: string) => void;
  language: string;
  onChangeLanguage: (lang: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  themeMode,
  onToggleTheme,
  accentColor,
  onSelectAccentColor,
  language,
  onChangeLanguage,
}) => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);

  // Close palette dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (paletteRef.current && !paletteRef.current.contains(event.target as Node)) {
        setIsPaletteOpen(false);
      }
    }
    if (isPaletteOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPaletteOpen]);

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 border-b border-[var(--border)] transition-colors duration-200">
      {/* Brand */}
      <div className="flex items-center gap-2.5 select-none">
        <img
          src="/icon.png"
          alt="Typeless Icon"
          className="w-7 h-7 rounded-lg object-cover shadow-sm border border-[var(--border)]"
          referrerPolicy="no-referrer"
        />
        <div className="flex items-center gap-1.5 font-display font-bold text-lg tracking-wide">
          <span className="text-[var(--accent)] font-mono text-base font-bold transition-colors duration-200">
            )))
          </span>
          <span className="text-[var(--text)] tracking-tight">Typeless</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 relative" ref={paletteRef}>
        {/* Language selector */}
        <select
          id="langSelect"
          value={language}
          onChange={(e) => onChangeLanguage(e.target.value)}
          aria-label="Recognition language"
          className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-sans focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-[var(--surface)] text-[var(--text)]">
              {lang.label}
            </option>
          ))}
        </select>

        {/* Theme mode toggle */}
        <button
          id="themeToggle"
          onClick={onToggleTheme}
          title={themeMode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          aria-label="Toggle Theme"
          className="w-9 h-9 flex items-center justify-center bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)] transition-all cursor-pointer text-base"
        >
          {themeMode === 'light' ? '◑' : '◐'}
        </button>

        {/* Accent Color Palette Button */}
        <button
          id="paletteBtn"
          onClick={() => setIsPaletteOpen((prev) => !prev)}
          title="Change Accent Color"
          aria-label="Accent Color"
          className={`w-9 h-9 flex items-center justify-center bg-[var(--surface)] border rounded-lg hover:border-[var(--accent)] transition-all cursor-pointer text-base ${
            isPaletteOpen ? 'border-[var(--accent)] shadow-sm' : 'border-[var(--border)]'
          }`}
        >
          🎨
        </button>

        {/* Palette Dropdown */}
        {isPaletteOpen && (
          <div
            id="palette"
            className="absolute top-12 right-0 z-30 flex items-center gap-2 p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
          >
            {ACCENT_COLORS.map((color) => {
              const isSelected = accentColor.toLowerCase() === color.value.toLowerCase();
              return (
                <button
                  key={color.name}
                  onClick={() => {
                    onSelectAccentColor(color.value);
                    setIsPaletteOpen(false);
                  }}
                  title={color.name}
                  data-color={color.value}
                  className="w-6 h-6 rounded-full cursor-pointer transition-transform hover:scale-115 relative flex items-center justify-center border border-black/10 dark:border-white/10"
                  style={{ backgroundColor: color.value }}
                >
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-black/70 shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};

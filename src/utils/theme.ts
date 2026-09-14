import { ACCENT_COLORS, ACCENT_COLOR_STORAGE_KEY, THEME_MODE_STORAGE_KEY } from '../constants';
import { ThemeMode } from '../types';

export function getStoredThemeMode(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_MODE_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch (err) {
    console.warn('Unable to access localStorage for theme mode:', err);
  }
  return 'dark';
}

export function getStoredAccentColor(): string {
  try {
    const saved = localStorage.getItem(ACCENT_COLOR_STORAGE_KEY);
    if (saved) {
      return saved;
    }
  } catch (err) {
    console.warn('Unable to access localStorage for accent color:', err);
  }
  return ACCENT_COLORS[0].value; // Default: Aqua (#5EEAD4)
}

export function applyThemeMode(mode: ThemeMode) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const body = document.body;

  if (mode === 'light') {
    root.classList.add('light');
    body.classList.add('light');
  } else {
    root.classList.remove('light');
    body.classList.remove('light');
  }

  try {
    localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
  } catch (err) {
    console.warn('Failed to save theme mode to localStorage:', err);
  }
}

export function applyAccentColor(hexColor: string) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.style.setProperty('--accent', hexColor);

  // Derive soft accent dim with opacity
  const cleanHex = hexColor.replace('#', '');
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    root.style.setProperty('--accent-dim', `rgba(${r}, ${g}, ${b}, 0.2)`);
  } else {
    root.style.setProperty('--accent-dim', `${hexColor}33`);
  }

  try {
    localStorage.setItem(ACCENT_COLOR_STORAGE_KEY, hexColor);
  } catch (err) {
    console.warn('Failed to save accent color to localStorage:', err);
  }
}

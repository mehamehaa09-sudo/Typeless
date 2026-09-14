import { AccentColor, LanguageOption } from './types';

export const THEME_MODE_STORAGE_KEY = 'typeless_theme_mode';
export const ACCENT_COLOR_STORAGE_KEY = 'typeless_accent_color';
export const LANGUAGE_STORAGE_KEY = 'typeless_language';
export const TRANSCRIPT_STORAGE_KEY = 'typeless_transcript';

export const ACCENT_COLORS: AccentColor[] = [
  { name: 'Aqua', value: '#5EEAD4' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Yellow', value: '#FACC15' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Grey', value: '#94A3B8' },
  { name: 'Maroon', value: '#7F1D1D' },
];

export const LANGUAGES: LanguageOption[] = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'ta-IN', label: 'Tamil' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'te-IN', label: 'Telugu' },
  { code: 'es-ES', label: 'Spanish' },
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' },
  { code: 'ja-JP', label: 'Japanese' },
];

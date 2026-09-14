import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MicStage } from './components/MicStage';
import { TopBar } from './components/TopBar';
import { TranscriptPanel } from './components/TranscriptPanel';
import { LANGUAGE_STORAGE_KEY, TRANSCRIPT_STORAGE_KEY } from './constants';
import { improveGrammar } from './utils/cleanup';
import {
  applyAccentColor,
  applyThemeMode,
  getStoredAccentColor,
  getStoredThemeMode,
} from './utils/theme';
import { ThemeMode } from './types';

// SpeechRecognition type declarations for Web Speech API
type SpeechRecognitionType = any;

export default function App() {
  // --- Persistent State ---
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => getStoredThemeMode());
  const [accentColor, setAccentColor] = useState<string>(() => getStoredAccentColor());
  const [language, setLanguage] = useState<string>(() => {
    try {
      return localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en-US';
    } catch {
      return 'en-US';
    }
  });
  const [finalTranscript, setFinalTranscript] = useState<string>(() => {
    try {
      return localStorage.getItem(TRANSCRIPT_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  // --- Runtime UI State ---
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isUnsupported, setIsUnsupported] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isImproving, setIsImproving] = useState<boolean>(false);

  // Refs to avoid stale closures in event listeners
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const isListeningRef = useRef<boolean>(false);
  const spaceHeldRef = useRef<boolean>(false);
  const finalTranscriptRef = useRef<string>(finalTranscript);
  const languageRef = useRef<string>(language);

  // Keep refs synchronized
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    finalTranscriptRef.current = finalTranscript;
    try {
      localStorage.setItem(TRANSCRIPT_STORAGE_KEY, finalTranscript);
    } catch (err) {
      console.warn('Failed to save transcript to localStorage:', err);
    }
  }, [finalTranscript]);

  useEffect(() => {
    languageRef.current = language;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (err) {
      console.warn('Failed to save language to localStorage:', err);
    }
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  // Synchronize and persist theme mode whenever changed
  useEffect(() => {
    applyThemeMode(themeMode);
  }, [themeMode]);

  // Synchronize and persist accent color whenever changed
  useEffect(() => {
    applyAccentColor(accentColor);
  }, [accentColor]);

  // Copy to clipboard helper
  const copyToClipboard = useCallback((textToCopy: string, isAutoCopy = false) => {
    const text = textToCopy.trim();
    if (!text) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopiedToast(true);
          setTimeout(() => setCopiedToast(false), 2000);
        })
        .catch((err) => {
          console.warn('Clipboard write failed, using fallback:', err);
          fallbackCopyText(text);
        });
    } else {
      fallbackCopyText(text);
    }
  }, []);

  const fallbackCopyText = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    } catch (e) {
      console.error('Fallback copy failed', e);
    }
    document.body.removeChild(textArea);
  };

  // Start Speech Recognition
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListeningRef.current) return;

    try {
      recognitionRef.current.lang = languageRef.current;
      recognitionRef.current.start();
      isListeningRef.current = true;
      setIsListening(true);
      setStatusMessage('Listening...');
    } catch (err: any) {
      // If already started, ignore error
      if (err.name !== 'InvalidStateError') {
        console.error('Recognition start error:', err);
      }
    }
  }, []);

  // Stop Speech Recognition
  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListeningRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.warn('Recognition stop error:', err);
    }

    isListeningRef.current = false;
    setIsListening(false);
    setInterimTranscript('');
    setStatusMessage('');

    // Auto-copy transcript upon stopping speech, preserving Typeless convenience
    const currentText = finalTranscriptRef.current.trim();
    if (currentText) {
      copyToClipboard(currentText, true);
    }
  }, [copyToClipboard]);

  // Toggle listening via mic button
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsUnsupported(true);
      setStatusMessage("Your browser doesn't support the Web Speech API. Please try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = languageRef.current;

    recognition.onresult = (event: any) => {
      let interim = '';
      let newFinals = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          newFinals += piece + ' ';
        } else {
          interim += piece;
        }
      }

      if (newFinals) {
        setFinalTranscript((prev) => prev + newFinals);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setStatusMessage('Microphone permission denied. Please allow microphone access.');
      } else if (event.error === 'no-speech') {
        // Normal silence event
      } else if (event.error === 'network') {
        setStatusMessage('Speech recognition network error. Please check your connection.');
      }
      stopListening();
    };

    recognition.onend = () => {
      // Auto-restart if user intends to continue listening (e.g. held space or still active)
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch {
          isListeningRef.current = false;
          setIsListening(false);
          setStatusMessage('');
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [stopListening]);

  // Spacebar Push-to-Talk keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside form inputs, buttons, or selects
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      if (e.code === 'Space' && !spaceHeldRef.current && !isInput) {
        e.preventDefault();
        spaceHeldRef.current = true;
        startListening();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && spaceHeldRef.current) {
        spaceHeldRef.current = false;
        stopListening();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [startListening, stopListening]);

  // Calculate dynamic word count
  const wordCount = useMemo(() => {
    const fullText = (finalTranscript + ' ' + interimTranscript).trim();
    if (!fullText) return 0;
    return fullText.split(/\s+/).filter(Boolean).length;
  }, [finalTranscript, interimTranscript]);

  // Toggle theme mode
  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Select accent color
  const handleSelectAccentColor = (color: string) => {
    setAccentColor(color);
  };

  // Clear transcript
  const handleClearTranscript = () => {
    setFinalTranscript('');
    setInterimTranscript('');
    try {
      localStorage.removeItem(TRANSCRIPT_STORAGE_KEY);
    } catch {}
  };

  // Improve Grammar action
  const handleImproveGrammar = async () => {
    const text = finalTranscript.trim();
    if (!text || isImproving) return;

    setIsImproving(true);
    setToastMessage('Improving grammar...');

    try {
      const improved = await improveGrammar(text);
      if (improved) {
        setFinalTranscript(improved + ' ');
        setToastMessage('Grammar improved & copied!');
        copyToClipboard(improved, true);
        setTimeout(() => setToastMessage(null), 2500);
      }
    } catch (err) {
      console.error('Grammar improvement error:', err);
      setToastMessage('Grammar improvement failed');
      setTimeout(() => setToastMessage(null), 2000);
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] transition-colors duration-200 relative selection:bg-[var(--accent)] selection:text-[var(--bg)]">
      {/* CRT Scanline Overlay */}
      <div className="scanline" />

      {/* Top Bar Navigation */}
      <TopBar
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        accentColor={accentColor}
        onSelectAccentColor={handleSelectAccentColor}
        language={language}
        onChangeLanguage={setLanguage}
      />

      {/* Main Interactive Stage */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-8 relative z-10 max-w-4xl w-full mx-auto">
        {/* Live Mic Stage */}
        <MicStage
          isListening={isListening}
          statusMessage={statusMessage}
          onToggleListen={toggleListening}
          isUnsupported={isUnsupported}
        />

        {/* Transcript Area & Action Bar */}
        <TranscriptPanel
          finalTranscript={finalTranscript}
          interimTranscript={interimTranscript}
          wordCount={wordCount}
          onCopy={() => copyToClipboard(finalTranscript.trim())}
          onImproveGrammar={handleImproveGrammar}
          onClear={handleClearTranscript}
          isImproving={isImproving}
          copiedToast={copiedToast}
          toastMessage={toastMessage}
          onTextChange={(newText) => setFinalTranscript(newText)}
        />

        {/* Browser Compatibility Notice */}
        {isUnsupported && (
          <p id="compatHint" className="mt-6 text-xs text-[var(--danger)] font-mono text-center max-w-md">
            Your browser doesn't support the Web Speech API. Please try Google Chrome or Microsoft Edge.
          </p>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[var(--muted)] border-t border-[var(--border)] transition-colors z-10">
        Built with the Web Speech API · Works best in Chrome / Edge
      </footer>
    </div>
  );
}

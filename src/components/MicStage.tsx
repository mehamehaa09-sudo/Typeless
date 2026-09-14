import React from 'react';

interface MicStageProps {
  isListening: boolean;
  statusMessage: string;
  onToggleListen: () => void;
  isUnsupported?: boolean;
}

export const MicStage: React.FC<MicStageProps> = ({
  isListening,
  statusMessage,
  onToggleListen,
  isUnsupported = false,
}) => {
  return (
    <div className="flex flex-col items-center gap-4 my-8">
      {/* Frequency / Channel Indicator */}
      <div className="flex items-center gap-2 font-mono text-[0.72rem] tracking-widest text-[var(--muted)] border border-[var(--border)] px-3 py-1 rounded-full bg-[var(--surface)] transition-colors">
        <span
          className={`w-2 h-2 rounded-full transition-colors ${
            isListening ? 'bg-[var(--accent)] animate-ping' : 'bg-[var(--muted)]'
          }`}
        />
        <span>{isListening ? 'CH. 01 — LIVE RECORDING' : 'CH. 01 — READY'}</span>
      </div>

      {/* Mic Button & Concentric Pulsing Rings */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Pulsing rings when listening */}
        {isListening && (
          <>
            <div className="absolute w-[88px] h-[88px] rounded-full border border-[var(--accent)] pulse-anim-1 pointer-events-none" />
            <div className="absolute w-[116px] h-[116px] rounded-full border border-[var(--accent)] pulse-anim-2 pointer-events-none" />
            <div className="absolute w-[142px] h-[142px] rounded-full border border-[var(--accent)] pulse-anim-3 pointer-events-none" />
          </>
        )}

        {/* Central mic button */}
        <button
          id="micBtn"
          onClick={onToggleListen}
          disabled={isUnsupported}
          aria-label={isListening ? 'Stop Recording' : 'Start Recording'}
          className={`w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 z-10 select-none ${
            isListening
              ? 'bg-[var(--accent)] text-[var(--bg)] shadow-[0_0_30px_var(--accent-dim)] scale-105'
              : 'bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--border)] hover:scale-105 hover:border-[var(--accent)]'
          } ${isUnsupported ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>
      </div>

      {/* Status Line */}
      <p id="statusLine" className="font-mono text-sm text-[var(--muted)] text-center transition-colors">
        {statusMessage ? (
          <span>{statusMessage}</span>
        ) : (
          <span>
            Click to talk, or hold{' '}
            <kbd className="bg-[var(--surface-2)] border border-[var(--border)] rounded px-1.5 py-0.5 text-xs text-[var(--text)] font-mono">
              Space
            </kbd>
          </span>
        )}
      </p>
    </div>
  );
};

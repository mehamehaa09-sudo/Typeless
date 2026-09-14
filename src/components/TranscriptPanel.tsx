import React, { useRef, useEffect } from 'react';

interface TranscriptPanelProps {
  finalTranscript: string;
  interimTranscript: string;
  wordCount: number;
  onCopy: () => void;
  onImproveGrammar: () => void;
  onClear: () => void;
  isImproving: boolean;
  copiedToast: boolean;
  toastMessage: string | null;
  onTextChange: (newText: string) => void;
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  finalTranscript,
  interimTranscript,
  wordCount,
  onCopy,
  onImproveGrammar,
  onClear,
  isImproving,
  copiedToast,
  toastMessage,
  onTextChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll transcript container as new words arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [finalTranscript, interimTranscript]);

  const hasContent = Boolean(finalTranscript.trim() || interimTranscript.trim());

  return (
    <section className="w-full max-w-[640px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden shadow-lg transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] font-mono text-[0.72rem] tracking-widest text-[var(--muted)] select-none">
        <span className="font-semibold text-[var(--text)]/80">TRANSCRIPT</span>
        <span id="wordCount">
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </span>
      </div>

      {/* Transcript Body */}
      <div
        ref={containerRef}
        id="transcript"
        className="min-h-[160px] max-h-[300px] overflow-y-auto p-5 font-mono text-sm sm:text-base leading-relaxed text-[var(--text)] outline-none relative break-words"
      >
        {hasContent ? (
          <div>
            <span>{finalTranscript}</span>
            {interimTranscript && (
              <span className="text-[var(--muted)] italic transition-colors">
                {interimTranscript}
              </span>
            )}
          </div>
        ) : (
          <p className="text-[var(--muted)] pointer-events-none select-none m-0">
            Your words will show up here as you speak...
          </p>
        )}
      </div>

      {/* Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center gap-2.5">
          <button
            id="copyBtn"
            onClick={onCopy}
            disabled={!finalTranscript.trim()}
            className="px-4 py-2 rounded-lg font-sans font-medium text-xs sm:text-sm bg-[var(--accent)] text-[var(--bg)] border border-[var(--accent)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm active:scale-95"
          >
            Copy
          </button>

          <button
            id="grammarBtn"
            onClick={onImproveGrammar}
            disabled={!finalTranscript.trim() || isImproving}
            className="px-4 py-2 rounded-lg font-sans font-medium text-xs sm:text-sm bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            {isImproving ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-[var(--accent)]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Improving...</span>
              </>
            ) : (
              'Improve Grammar'
            )}
          </button>

          <button
            id="clearBtn"
            onClick={onClear}
            disabled={!hasContent}
            className="px-4 py-2 rounded-lg font-sans font-medium text-xs sm:text-sm bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--danger)] hover:text-[var(--danger)] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95"
          >
            Clear
          </button>
        </div>

        {/* Feedback / Toast Messages */}
        <div className="h-6 flex items-center">
          {copiedToast && (
            <span
              id="copiedToast"
              className="font-mono text-xs text-[var(--accent)] font-medium animate-in fade-in duration-200"
            >
              Copied to Clipboard!
            </span>
          )}
          {!copiedToast && toastMessage && (
            <span
              id="grammarStatus"
              className="font-mono text-xs text-[var(--accent)] font-medium animate-in fade-in duration-200"
            >
              {toastMessage}
            </span>
          )}
        </div>
      </div>
    </section>
  );
};

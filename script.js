  // ============================================================
  // Typeless — MVP
  // Uses the browser's built-in Web Speech API (no backend, no API key)
  // Docs: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
  // ============================================================

  // --- Grab all the DOM elements we'll need ---
  const micBtn        = document.getElementById('micBtn');
  const statusLine    = document.getElementById('statusLine');
  const transcriptEl  = document.getElementById('transcript');
  const wordCountEl    = document.getElementById('wordCount');
  const copyBtn       = document.getElementById('copyBtn');
  const grammarBtn    = document.getElementById('grammarBtn');
  const grammarStatus = document.getElementById('grammarStatus');
  const clearBtn      = document.getElementById('clearBtn');
  const copiedToast   = document.getElementById('copiedToast');
  const langSelect    = document.getElementById('langSelect');
  const themeToggle   = document.getElementById('themeToggle');
  const compatHint    = document.getElementById('compatHint');

  // --- State ---
  let finalTranscript = '';   // text we've locked in
  let isListening = false;
  let spaceHeld = false;      // tracks whether spacebar is currently held (for hold-to-talk)

  // --- Check browser support first ---
  // Chrome/Edge expose this as webkitSpeechRecognition; some browsers don't support it at all.
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const paletteBtn = document.getElementById("paletteBtn");
  const palette = document.getElementById("palette");

  paletteBtn.onclick = () => {

      palette.classList.toggle("hidden");

  }
  let recognition;

  if (!SpeechRecognition) {
    compatHint.textContent =
      "Your browser doesn't support the Web Speech API. Please try Chrome or Edge.";
    micBtn.disabled = true;
  } else {
    initRecognition();
  }


  function initRecognition() {
    recognition = new SpeechRecognition();
    recognition.continuous = true;      // keep listening until we explicitly stop
    recognition.interimResults = true;  // give us live, in-progress results too
    recognition.lang = langSelect.value;

    // Fired repeatedly while speech is being recognized
    recognition.onresult = (event) => {
      let interimTranscript = '';

      // event.results is a list of all results since recognition started.
      // Each result can be "final" (locked in) or still "interim" (in progress).
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece + ' ';
        } else {
          interimTranscript += transcriptPiece;
        }
      }

      renderTranscript(interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        statusLine.textContent = 'Microphone permission denied.';
      }
      stopListening();
    };

    recognition.onend = () => {
      // Browsers auto-stop recognition after a period of silence.
      // If the user still wants to be listening (e.g. holding space), restart it.
      if (isListening) {
        recognition.start();
      }
    };
  }

  // --- Render the final + interim text into the transcript box ---
  function renderTranscript(interimTranscript) {
    transcriptEl.innerHTML =
      escapeHtml(finalTranscript) +
      `<span class="interim">${escapeHtml(interimTranscript)}</span>`;

    transcriptEl.scrollTop = transcriptEl.scrollHeight;
    updateWordCount();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function updateWordCount() {
    const words = finalTranscript.trim().split(/\s+/).filter(Boolean);
    wordCountEl.textContent = `${words.length} word${words.length === 1 ? '' : 's'}`;
  }

  // --- Start / stop listening ---
  function startListening() {
    if (!SpeechRecognition || isListening) return;
    recognition.lang = langSelect.value;
    isListening = true;
    document.body.classList.add('listening');
    statusLine.textContent = 'Listening...';
    micBtn.setAttribute('aria-label', 'Stop recording');
    recognition.start();
  }

  function stopListening() {
    if (!SpeechRecognition || !isListening) return;
    isListening = false;
    document.body.classList.remove('listening');
    statusLine.textContent = 'Click to talk, or hold Space';
    micBtn.setAttribute('aria-label', 'Start recording');
    recognition.stop();

    // Auto-copy once speech ends, matching the "auto copy" feature from the plan
    if (finalTranscript.trim()) {
      copyToClipboard(finalTranscript.trim(), true);
    }
  }

  // --- Click-to-toggle mode ---
  micBtn.addEventListener('click', () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  });

  // --- Hold-to-talk mode (Spacebar) ---
  document.addEventListener('keydown', (e) => {
    // Ignore if user is typing inside the language dropdown, etc.
    if (e.code === 'Space' && !spaceHeld && document.activeElement.tagName !== 'SELECT') {
      e.preventDefault();
      spaceHeld = true;
      startListening();
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.code === 'Space' && spaceHeld) {
      spaceHeld = false;
      stopListening();
    }
  });

  // --- Copy button ---
  copyBtn.addEventListener('click', () => {
    copyToClipboard(finalTranscript.trim());
  });

  function copyToClipboard(text, silent = false) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      copiedToast.classList.add('show');
      setTimeout(() => copiedToast.classList.remove('show'), 1800);
    }).catch((err) => {
      console.error('Clipboard write failed:', err);
    });
  }

  // --- Improve Grammar button ---
  // Sends the current transcript to our own Flask backend, which forwards it
  // to the Anthropic API and returns a grammar-corrected version.
  const BACKEND_URL = 'https://github.com/mehamehaa09-sudo/Typeless';

  grammarBtn.addEventListener('click', async () => {
    const text = finalTranscript.trim();
    if (!text) return;

    grammarBtn.disabled = true;
    showGrammarStatus('Improving...');

    try {
      const res = await fetch(`${BACKEND_URL}/cleanup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Request failed');
      }

      const data = await res.json();
      finalTranscript = data.cleaned + ' ';
      renderTranscript('');
      showGrammarStatus('Grammar improved!');
      copyToClipboard(finalTranscript.trim(), true);
      showGrammarStatus("Grammar improved & copied!");
    } catch (err) {
      console.error('Grammar cleanup failed:', err);
      showGrammarStatus('Could not reach backend — is it running?');
    } finally {
      grammarBtn.disabled = false;
    }
  });

  function showGrammarStatus(message) {
    grammarStatus.textContent = message;
    grammarStatus.classList.add('show');
    setTimeout(() => grammarStatus.classList.remove('show'), 2500);
  }

  // --- Clear button ---
  clearBtn.addEventListener('click', () => {
    finalTranscript = '';
    transcriptEl.innerHTML = '';
    updateWordCount();
  });

  // --- Dark / light mode toggle ---
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
    themeToggle.textContent = document.body.classList.contains('light') ? '◑' : '◐';
  });

  // --- Language change should apply immediately, even mid-session ---
  langSelect.addEventListener('change', () => {
    if (recognition) recognition.lang = langSelect.value;
  });
  // --- Accent color palette ---
  document.querySelectorAll('.theme-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const color = dot.dataset.color;
      document.documentElement.style.setProperty('--accent', color);
      palette.classList.add('hidden'); // close panel after picking
    });
  });

# Typeless 🎤 — Zero-Typing Notepad

A tiny web app that turns your voice into text live in the browser, then
copies it to your clipboard so you can paste it anywhere.

## Features (MVP)
- Live speech-to-text using the browser's built-in **Web Speech API**
- Click-to-toggle **or** hold **Space** to talk (walkie-talkie style)
- Auto-copies the transcript when you stop talking
- Manual **Copy** / **Clear** buttons
- Language selector (English / Tamil / Hindi / Telugu)
- Dark / light mode
- Live word count

## Tech stack
- HTML, CSS, JavaScript — no frameworks, no backend, no build step
- `SpeechRecognition` / `webkitSpeechRecognition` (Web Speech API)
- `navigator.clipboard` (Clipboard API)

## Running it locally
No installs needed. Just open `index.html` in **Chrome or Edge**
(the Web Speech API isn't well supported in Firefox/Safari yet).

Or, to avoid any file:// quirks, serve it locally:
```bash
# Python 3
python3 -m http.server 8000
# then open http://localhost:8000
```

## Known limitations
- Requires an internet connection (Chrome sends audio to Google's servers
  for recognition — this is a browser limitation, not something this app does).
- Accuracy depends on your mic, accent, and background noise.
- Not all browsers support the Web Speech API.

## Backend — "Improve Grammar" (v2)

The frontend now has an **Improve Grammar** button that calls a small Flask
backend, which forwards your text to the **Google Gemini API** and returns a
corrected version.

**Architecture:**
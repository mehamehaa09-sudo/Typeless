const BACKEND_URL = 'https://typeless-8zps.onrender.com';

export function enhanceGrammarClient(rawText: string): string {
  if (!rawText || !rawText.trim()) return '';

  let text = rawText.trim();

  // Normalize multiple spaces
  text = text.replace(/\s+/g, ' ');

  // Fix standalone lowercase 'i' and common contractions
  text = text.replace(/\bi\b/g, 'I');
  text = text.replace(/\bi'm\b/gi, "I'm");
  text = text.replace(/\bi'll\b/gi, "I'll");
  text = text.replace(/\bi've\b/gi, "I've");
  text = text.replace(/\bi'd\b/gi, "I'd");
  text = text.replace(/\bdont\b/gi, "don't");
  text = text.replace(/\bcant\b/gi, "can't");
  text = text.replace(/\bwont\b/gi, "won't");
  text = text.replace(/\bdidnt\b/gi, "didn't");
  text = text.replace(/\bisnt\b/gi, "isn't");
  text = text.replace(/\barent\b/gi, "aren't");
  text = text.replace(/\bwasnt\b/gi, "wasn't");
  text = text.replace(/\bwerent\b/gi, "weren't");

  // Fix spacing before punctuation
  text = text.replace(/\s+([.,!?;:])/g, '$1');

  // Ensure space after punctuation if followed by a letter
  text = text.replace(/([.,!?;:])([A-Za-z])/g, '$1 $2');

  // Capitalize first letter of every sentence
  text = text.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_match, separator, char) => {
    return separator + char.toUpperCase();
  });

  // Ensure first character is uppercase
  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  // Ensure sentence ends with punctuation if it doesn't already
  if (!/[.!?]$/.test(text)) {
    text += '.';
  }

  return text;
}

export async function improveGrammar(text: string): Promise<string> {
  const cleanInput = text.trim();
  if (!cleanInput) return '';

  // Attempt backend API with 4s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${BACKEND_URL}/cleanup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanInput }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.cleaned === 'string' && data.cleaned.trim()) {
        return data.cleaned.trim();
      }
    }
  } catch (err) {
    console.info('Backend cleanup service unavailable, utilizing built-in grammar enhancer:', err);
  }

  // Fallback to robust client-side formatting
  return enhanceGrammarClient(cleanInput);
}

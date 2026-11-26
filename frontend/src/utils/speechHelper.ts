export interface SpeechCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeaking(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}

export function speakText(
  text: string,
  lang: 'en-IN' | 'hi-IN' = 'en-IN',
  rate = 1.0,
  callbacks?: SpeechCallbacks
): void {
  if (!isSpeechSupported()) {
    callbacks?.onError?.();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;

  const voices = window.speechSynthesis.getVoices();
  const matchedVoice =
    voices.find((v) => v.lang.toLowerCase().startsWith(lang.toLowerCase())) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(lang.slice(0, 2)));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onstart = () => callbacks?.onStart?.();
  utterance.onend = () => callbacks?.onEnd?.();
  utterance.onerror = () => callbacks?.onError?.();

  window.speechSynthesis.speak(utterance);
}

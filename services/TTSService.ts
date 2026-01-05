export class TTSService {
  // Keep a reference to prevent Garbage Collection from stopping long speech
  private static activeUtterance: SpeechSynthesisUtterance | null = null;

  static speak(text: string, lang: string = 'en-US', onEnd?: () => void): void {
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-speech not supported in this browser.');
      if (onEnd) onEnd();
      return;
    }

    // Cancel any currently playing audio
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    this.activeUtterance = utterance; // Store reference

    utterance.lang = lang;
    utterance.rate = 0.9; 
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      voice => voice.lang === lang && (voice.name.includes('Google') || voice.name.includes('Samantha'))
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Event listeners
    utterance.onend = () => {
      this.activeUtterance = null; // Release reference
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.error('TTS Error:', e);
      this.activeUtterance = null;
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  static stop(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.activeUtterance = null;
    }
  }
}
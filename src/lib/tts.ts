// TTS — Web Speech API, zh-TW only, no zh-CN fallback. Ported verbatim from
// the original single-file app.

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      resolve([]);
      return;
    }
    const voices = speechSynthesis.getVoices();
    if (voices.length) {
      resolve(voices);
      return;
    }
    speechSynthesis.onvoiceschanged = () => resolve(speechSynthesis.getVoices());
    setTimeout(() => resolve(speechSynthesis.getVoices()), 800);
  });
}

export interface TtsState {
  ready: boolean;
  voices: SpeechSynthesisVoice[];
  chosenVoice: SpeechSynthesisVoice | null;
}

export async function initTTS(): Promise<TtsState> {
  const all = await loadVoices();
  const voices = all.filter((v) => v.lang && v.lang.replace("_", "-").toLowerCase() === "zh-tw");
  return {
    ready: voices.length > 0,
    voices,
    chosenVoice: voices[0] || null,
  };
}

export function speak(
  text: string,
  chosenVoice: SpeechSynthesisVoice | null,
  ready: boolean,
  rate: number,
): void {
  if (!ready || !chosenVoice) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = chosenVoice;
    u.lang = "zh-TW";
    u.rate = rate || 1;
    speechSynthesis.speak(u);
  } catch (e) {
    console.warn("speak failed", e);
  }
}

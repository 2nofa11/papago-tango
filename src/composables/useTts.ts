import { ref, shallowRef } from "vue";
import { initTTS, speak as speakPure } from "../lib/tts";
import { useSettings } from "./useSettings";

const ready = ref(false);
const voices = shallowRef<SpeechSynthesisVoice[]>([]);
const chosenVoice = shallowRef<SpeechSynthesisVoice | null>(null);

async function init() {
  const state = await initTTS();
  ready.value = state.ready;
  voices.value = state.voices;
  chosenVoice.value = state.chosenVoice;
}

function speak(text: string, rateOverride?: number) {
  const { rate } = useSettings();
  speakPure(text, chosenVoice.value, ready.value, rateOverride ?? rate.value);
}

export function useTts() {
  return { ready, voices, chosenVoice, init, speak };
}

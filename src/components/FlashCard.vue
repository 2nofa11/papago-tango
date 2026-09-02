<script setup lang="ts">
import { computed, watch } from "vue";
import type { Mode, Word } from "../types";
import { useTts } from "../composables/useTts";
import { useSettings } from "../composables/useSettings";
import { splitExample, splitPinyin } from "../lib/pinyin";

const props = defineProps<{ word: Word; mode: Mode; flipped: boolean }>();
const emit = defineEmits<{ flip: [] }>();

const { speak } = useTts();
const { toneColor } = useSettings();

const pinyinChars = computed(() => splitPinyin(props.word.p));
const example = computed(() => splitExample(props.word.e[0], props.word.h));
const exampleJa = computed(() => props.word.e[2] ?? "");

function onCardClick() {
  if (!props.flipped) emit("flip");
}
function onCardKeydown(e: KeyboardEvent) {
  if (e.key === "Enter") {
    e.preventDefault();
    if (!props.flipped) emit("flip");
  }
}

// F1: auto-play pronunciation as soon as an unflipped card is shown.
// F2: auto-play once the card is flipped to reveal the reading. 150ms delay
// matches the original single-file app's setTimeout.
watch(
  () => [props.word, props.flipped] as const,
  ([word, flipped]) => {
    if (props.mode === "F1" && !flipped) {
      setTimeout(() => speak(word.h), 150);
    } else if (props.mode === "F2" && flipped) {
      setTimeout(() => speak(word.h), 150);
    }
  },
  { immediate: true },
);
</script>

<template>
  <div
    id="card"
    role="button"
    tabindex="0"
    aria-label="タップまたはEnterでめくる"
    @click="onCardClick"
    @keydown="onCardKeydown"
  >
    <div class="lessonTag" id="cardLesson">L{{ word.l }}</div>

    <div id="promptArea" :class="{ hidden: flipped }">
      <button
        v-if="mode === 'F1'"
        class="speakerBtn"
        id="promptSpeaker"
        type="button"
        aria-label="発音を再生"
        @click.stop="speak(word.h)"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
        発音
      </button>
      <div id="promptMain">{{ mode === "F2" ? word.h : "" }}</div>
      <div id="promptSub">{{ mode === "F1" ? "タップして再生" : "" }}</div>
      <div class="tapHint">タップ / Space でめくる</div>
    </div>

    <div id="answerBlock" :class="{ hidden: !flipped }" aria-live="polite">
      <div style="display: flex; align-items: center; gap: 8px">
        <div id="ansHanzi">{{ word.h }}</div>
        <button
          class="speakerBtn"
          id="ansSpeaker"
          type="button"
          aria-label="発音を再生"
          @click.stop="speak(word.h)"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          </svg>
          発音
        </button>
      </div>
      <div id="ansPinyin">
        <template v-if="toneColor">
          <span
            v-for="(c, i) in pinyinChars"
            :key="i"
            :style="c.tone ? { color: `var(--t${c.tone})` } : undefined"
            >{{ c.char }}</span
          >
        </template>
        <template v-else>{{ word.p }}</template>
      </div>
      <div id="ansMeaning">{{ word.m }}</div>
      <div id="ansNote" v-if="word.n">{{ word.n }}</div>
      <div id="ansExample">
        <div id="exHanzi">
          {{ example.before }}<mark v-if="example.match">{{ example.match }}</mark
          >{{ example.after }}
        </div>
        <div id="exPinyin">{{ word.e[1] || "" }}</div>
        <div id="exJa" v-if="exampleJa">{{ exampleJa }}</div>
      </div>
    </div>
  </div>
</template>

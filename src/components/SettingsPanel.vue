<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import { useSettings } from "../composables/useSettings";
import { useTts } from "../composables/useTts";
import { useProgress } from "../composables/useProgress";
import { todayStr } from "../lib/storage";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();

const {
  newPerDay,
  newPerDayUnlimited,
  reviewCap,
  reviewCapUnlimited,
  sessionSize,
  rate,
  toneColor,
} = useSettings();
const { voices, chosenVoice } = useTts();
const { progress, meta, resetAll } = useProgress();

const panelEl = ref<HTMLElement | null>(null);
const closeBtnEl = ref<HTMLButtonElement | null>(null);

function onVoiceChange(e: Event) {
  const idx = Number((e.target as HTMLSelectElement).value);
  chosenVoice.value = voices.value[idx] || chosenVoice.value;
}

function onOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) emit("close");
}

function exportProgress() {
  const data = { progress, meta, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `papago_progress_${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function resetProgress() {
  if (confirm("全ての学習進捗を消去します。よろしいですか？")) {
    resetAll();
    alert("リセットしました。");
  }
}

// keep Tab cycling inside the settings drawer while it's open
function onTrapKeydown(e: KeyboardEvent) {
  if (e.key !== "Tab" || !panelEl.value) return;
  const focusables = panelEl.value.querySelectorAll<HTMLElement>(
    'button, input, select, [tabindex]:not([tabindex="-1"])',
  );
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      document.addEventListener("keydown", onTrapKeydown);
      await nextTick();
      closeBtnEl.value?.focus();
    } else {
      document.removeEventListener("keydown", onTrapKeydown);
    }
  },
);
onBeforeUnmount(() => document.removeEventListener("keydown", onTrapKeydown));
</script>

<template>
  <div id="settingsOverlay" v-show="open" @click="onOverlayClick">
    <div
      id="settingsPanel"
      ref="panelEl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settingsTitle"
    >
      <div id="settingsHandle" aria-hidden="true"></div>
      <button id="closeSettings" ref="closeBtnEl" type="button" @click="emit('close')">
        閉じる ✕
      </button>
      <h2 id="settingsTitle">設定</h2>
      <div class="setting-row">
        <label for="setNewPerDay">新規カード/日</label>
        <div class="setting-control">
          <input
            type="number"
            inputmode="numeric"
            id="setNewPerDay"
            name="newPerDay"
            autocomplete="off"
            min="0"
            max="200"
            v-model.number="newPerDay"
            :disabled="newPerDayUnlimited"
          />
          <label class="unlimited-toggle"
            ><input type="checkbox" id="setNewPerDayUnlimited" v-model="newPerDayUnlimited" />
            無制限</label
          >
        </div>
      </div>
      <div class="setting-row">
        <label for="setReviewCap">1日の復習上限</label>
        <div class="setting-control">
          <input
            type="number"
            inputmode="numeric"
            id="setReviewCap"
            name="reviewCap"
            autocomplete="off"
            min="10"
            max="500"
            v-model.number="reviewCap"
            :disabled="reviewCapUnlimited"
          />
          <label class="unlimited-toggle"
            ><input type="checkbox" id="setReviewCapUnlimited" v-model="reviewCapUnlimited" />
            無制限</label
          >
        </div>
      </div>
      <div class="setting-row">
        <label for="setSessionSize">セッション枚数</label>
        <select id="setSessionSize" v-model.number="sessionSize">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="30">30</option>
        </select>
      </div>
      <div class="setting-row">
        <label for="setRate">再生速度</label>
        <select id="setRate" v-model.number="rate">
          <option :value="0.8">0.8×（ゆっくり）</option>
          <option :value="1">1.0×</option>
          <option :value="1.2">1.2×</option>
        </select>
      </div>
      <div class="setting-row">
        <label for="setVoice">zh-TW 音声</label>
        <select id="setVoice" :disabled="voices.length === 0" @change="onVoiceChange">
          <option v-if="voices.length === 0">未検出</option>
          <option v-for="(v, i) in voices" :key="v.name" :value="i">{{ v.name }}</option>
        </select>
      </div>
      <div class="setting-row">
        <label for="setToneColor">声調の色分け</label>
        <select id="setToneColor" v-model="toneColor">
          <option :value="true">ON</option>
          <option :value="false">OFF</option>
        </select>
      </div>
      <button class="settings-btn" id="exportBtn" type="button" @click="exportProgress">
        進捗をJSONでエクスポート
      </button>
      <button class="settings-btn danger" id="resetBtn" type="button" @click="resetProgress">
        進捗をリセット（全消去）
      </button>
    </div>
  </div>
</template>

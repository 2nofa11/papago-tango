<script setup lang="ts">
import { computed, ref } from "vue";
import { VOCAB } from "../data/vocab";
import { useProgress } from "../composables/useProgress";

const emit = defineEmits<{ gear: [] }>();

const { storageBackend, ready } = useProgress();

const storageLabels: Record<string, string> = {
  artifact: "保存先: このチャットの永続ストレージ",
  local: "保存先: このブラウザ（localStorage）",
  memory: "保存先: なし（このタブを閉じると消えます）",
};
const storageBadgeText = computed(() =>
  ready.value ? storageLabels[storageBackend.value] || "" : "保存先: 確認中…",
);

const gearBtnEl = ref<HTMLButtonElement | null>(null);
defineExpose({ focus: () => gearBtnEl.value?.focus() });
</script>

<template>
  <header>
    <div>
      <h1>台湾華語 単語帳</h1>
      <div class="sub" id="headerSub">PAPAGO式 Lesson 1〜56・{{ VOCAB.length }}語 POC</div>
      <div class="sub" id="storageBadge" style="opacity: 0.7">{{ storageBadgeText }}</div>
    </div>
    <button id="gearBtn" ref="gearBtnEl" type="button" aria-label="設定" @click="emit('gear')">
      ⚙
    </button>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSession } from "../composables/useSession";
import { useProgress } from "../composables/useProgress";
import { useTts } from "../composables/useTts";
import type { Mode, RangeKey } from "../types";

const { uiMode, uiRange, menuStats, start, vocab } = useSession();
const { storageBackend, ready: storageReady } = useProgress();
const { ready: ttsReady } = useTts();

const modes: { mode: Mode; icon: string; title: string; desc: string }[] = [
  { mode: "F1", icon: "🔊", title: "音声 → 単語", desc: "聞いて、意味が言えたら○" },
  { mode: "F2", icon: "📝", title: "単語 → 意味", desc: "漢字を見て、読みと意味が言えたら○" },
];

const ranges: { key: RangeKey; label: string }[] = [
  { key: "all", label: `全て (${vocab.length})` },
  { key: "1-13", label: "L1–13" },
  { key: "14-25", label: "L14–25" },
  { key: "26-38", label: "L26–38" },
  { key: "39-54", label: "L39–54" },
  { key: "55-56", label: "L55–56" },
  { key: "weak", label: "苦手のみ" },
];

const stats = computed(() => menuStats());

const warnMessages = computed(() => {
  const msgs: string[] = [];
  if (storageReady.value && storageBackend.value === "memory") {
    msgs.push(
      "⚠ この環境では進捗を保存できません（ページを閉じると失われます）。設定 → 進捗をJSONでエクスポート、で手動保存してください。",
    );
  }
  if (storageReady.value && !ttsReady.value) {
    msgs.push(
      "この端末では台湾華語（zh-TW）の音声が見つかりませんでした。大陸普通話へは自動で切り替えません。「音声→単語」モードは無効化されます。設定 → 音声認識/読み上げ言語 から「中文（台灣）」の音声を追加してください。",
    );
  }
  return msgs;
});
</script>

<template>
  <div id="menuScreen" class="screen">
    <div>
      <h2 class="field-label">出題モード</h2>
      <div class="mode-pick">
        <button
          v-for="m in modes"
          :key="m.mode"
          type="button"
          class="mode-card"
          :class="{ selected: uiMode === m.mode }"
          :disabled="m.mode === 'F1' && !ttsReady"
          :data-mode="m.mode"
          @click="uiMode = m.mode"
        >
          <div class="icon" aria-hidden="true">{{ m.icon }}</div>
          <div>
            <div class="title">{{ m.title }}</div>
            <div class="desc">{{ m.desc }}</div>
          </div>
        </button>
      </div>
    </div>

    <div>
      <h2 class="field-label">範囲</h2>
      <div class="chip-row" id="rangeChips">
        <button
          v-for="r in ranges"
          :key="r.key"
          type="button"
          class="chip"
          :class="{ active: uiRange === r.key }"
          :data-range="r.key"
          @click="uiRange = r.key"
        >
          {{ r.label }}
        </button>
      </div>
    </div>

    <div id="voiceWarn" v-if="warnMessages.length">
      <div v-for="(msg, i) in warnMessages" :key="i">{{ msg }}</div>
    </div>

    <div>
      <div class="stat-line">
        <span>本日の復習予定</span><b id="statDue">{{ stats.due }}</b>
      </div>
      <div class="stat-line">
        <span>新規（本日残り）</span><b id="statNew">{{ stats.newAvailable }}</b>
      </div>
      <div class="stat-line">
        <span>習得済み</span><b id="statMastered">{{ stats.mastered }} / {{ stats.poolLength }}</b>
      </div>
    </div>

    <button id="startBtn" type="button" :disabled="stats.startDisabled" @click="start">
      開始する
    </button>
  </div>
</template>

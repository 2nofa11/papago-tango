<script setup lang="ts">
import { computed } from "vue";
import { useSession } from "../composables/useSession";
import FlashCard from "./FlashCard.vue";

const { session, sIndex, uiMode, flipped, currentWord, flip, judge, requestAbort } = useSession();

const progText = computed(() => `${sIndex.value + 1}/${session.length}`);
const progPercent = computed(() => `${(sIndex.value / session.length) * 100}%`);
</script>

<template>
  <div id="sessionScreen" class="screen">
    <div id="progRow">
      <button id="closeSession" type="button" @click="requestAbort">✕ 中断</button>
      <div id="progBarOuter"><div id="progBarInner" :style="{ width: progPercent }"></div></div>
      <span id="progText" aria-live="polite">{{ progText }}</span>
    </div>

    <FlashCard
      v-if="currentWord"
      :word="currentWord"
      :mode="uiMode"
      :flipped="flipped"
      @flip="flip"
    />

    <div id="judgeRow" :class="{ hidden: !flipped }">
      <button class="judgeBtn" id="btnWrong" type="button" @click="judge(false)">
        × <small>難しい</small>
      </button>
      <button class="judgeBtn" id="btnRight" type="button" @click="judge(true)">
        ○ <small>覚えた</small>
      </button>
    </div>
    <div id="kbdHints">
      <span><kbd>Space</kbd> めくる/再生</span><span><kbd>F</kbd> ×</span
      ><span><kbd>J</kbd> ○</span>
    </div>
  </div>
</template>

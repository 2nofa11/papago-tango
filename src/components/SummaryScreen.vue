<script setup lang="ts">
import { useSession } from "../composables/useSession";

const { sCorrect, sWrong, backToMenu, start } = useSession();

function again() {
  start();
}
</script>

<template>
  <div id="summaryScreen" class="screen">
    <div class="big" aria-hidden="true">🎴</div>
    <div style="font-size: 15px; font-weight: 700">セッション終了</div>
    <div id="summaryStats" aria-live="polite">
      <div>
        <div class="num" style="color: var(--jade)">{{ sCorrect }}</div>
        <div class="lbl">○ 覚えた</div>
      </div>
      <div>
        <div class="num" style="color: var(--seal)">{{ sWrong }}</div>
        <div class="lbl">× 難しい</div>
      </div>
    </div>
    <div style="display: flex; gap: 10px">
      <button id="backBtn" type="button" @click="backToMenu">メニューへ</button>
      <button id="againBtn" type="button" @click="again">もう一巡</button>
    </div>
  </div>
</template>

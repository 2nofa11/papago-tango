<script setup lang="ts">
import { computed } from "vue";
import { useSession } from "../composables/useSession";
import { BOX_DAYS, formatInterval } from "../lib/srs";

const { shelfCounts } = useSession();

const counts = computed(() => shelfCounts());
const boxNums = [1, 2, 3, 4, 5, 6, 7] as const;
const maxCount = computed(() =>
  Math.max(1, ...boxNums.map((b) => counts.value[b]), counts.value.mastered),
);
const barHeight = (n: number) => `${Math.max(4, (n / maxCount.value) * 30)}px`;

const labels = boxNums.map((b) => formatInterval(BOX_DAYS[b]));

const ariaLabel = computed(
  () =>
    boxNums
      .map((b) => `次の復習まで${formatInterval(BOX_DAYS[b])}: ${counts.value[b]}件`)
      .join("、") + `、習得済み: ${counts.value.mastered}件`,
);
</script>

<template>
  <div id="shelf">
    <div id="shelfCaption">覚えた度合い（右にいくほど定着、済＝習得済み）</div>
    <div id="shelfRow" role="img" :aria-label="ariaLabel">
      <div class="box-col" v-for="b in boxNums" :key="b">
        <div class="box-bar" :style="{ height: barHeight(counts[b]) }"></div>
        <div class="box-num">{{ counts[b] }}</div>
      </div>
      <div class="box-col">
        <div class="box-bar hot" :style="{ height: barHeight(counts.mastered) }"></div>
        <div class="box-num">{{ counts.mastered }}</div>
      </div>
    </div>
    <div id="shelfLabels">
      <span v-for="(label, i) in labels" :key="i">{{ label }}</span>
      <span>済</span>
    </div>
  </div>
</template>

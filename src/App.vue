<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import AppHeader from "./components/AppHeader.vue";
import BoxShelf from "./components/BoxShelf.vue";
import MenuScreen from "./components/MenuScreen.vue";
import SessionScreen from "./components/SessionScreen.vue";
import SummaryScreen from "./components/SummaryScreen.vue";
import SettingsPanel from "./components/SettingsPanel.vue";
import { useProgress } from "./composables/useProgress";
import { useSession } from "./composables/useSession";
import { useSettings } from "./composables/useSettings";
import { useTts } from "./composables/useTts";

const { screen, flipped, currentWord, flip, judge, requestAbort } = useSession();
const { init: initProgress } = useProgress();
const { init: initTts, speak } = useTts();
const { rate } = useSettings();

const settingsOpen = ref(false);
const headerEl = ref<InstanceType<typeof AppHeader> | null>(null);

function openSettings() {
  settingsOpen.value = true;
}
function closeSettings() {
  settingsOpen.value = false;
  headerEl.value?.focus();
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && settingsOpen.value) {
    closeSettings();
    return;
  }
  if (screen.value !== "session") return;
  if (e.code === "Space") {
    e.preventDefault();
    if (flipped.value && currentWord.value) speak(currentWord.value.h, rate.value);
    else flip();
  } else if (e.key === "j" || e.key === "J") {
    judge(true);
  } else if (e.key === "f" || e.key === "F") {
    judge(false);
  } else if (e.key === "Escape") {
    requestAbort();
  }
}

onMounted(async () => {
  document.addEventListener("keydown", onKeydown);
  await initProgress();
  await initTts();
});
onBeforeUnmount(() => document.removeEventListener("keydown", onKeydown));
</script>

<template>
  <div id="app">
    <AppHeader ref="headerEl" @gear="openSettings" />
    <BoxShelf />
    <main>
      <MenuScreen v-if="screen === 'menu'" />
      <SessionScreen v-else-if="screen === 'session'" />
      <SummaryScreen v-else />
    </main>
  </div>
  <SettingsPanel :open="settingsOpen" @close="closeSettings" />
</template>

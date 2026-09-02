import { reactive, ref } from "vue";
import {
  ensureMetaFresh,
  loadState,
  saveMeta,
  saveProgress,
  setStorageBadgeListener,
  todayStr,
} from "../lib/storage";
import { gradeCard as gradeCardPure } from "../lib/srs";
import type { Meta, Mode, Progress, StorageBackend, Word } from "../types";

// Shared reactive state for saved progress + today's new-card counter.
// Module-scope singletons (not Pinia — this app has exactly one "store").
const progress = reactive<Progress>({});
const meta = reactive<Meta>({ date: "", count: 0 });
const storageBackend = ref<StorageBackend>("memory");
const ready = ref(false);

setStorageBadgeListener((backend) => {
  storageBackend.value = backend;
});

async function init() {
  const loaded = await loadState();
  Object.assign(progress, loaded.progress);
  Object.assign(meta, loaded.meta);
  ready.value = true;
}

function refreshMetaIfStale() {
  const fresh = ensureMetaFresh(meta);
  if (fresh !== meta) Object.assign(meta, fresh);
}

function gradeCard(w: Word, mode: Mode, correct: boolean) {
  const result = gradeCardPure(progress, meta, w, mode, correct);
  Object.assign(progress, result.progress);
  Object.assign(meta, result.meta);
  saveProgress(progress);
  saveMeta(meta);
}

function resetAll() {
  for (const k of Object.keys(progress)) delete progress[k];
  Object.assign(meta, { date: todayStr(), count: 0 });
  saveProgress(progress);
  saveMeta(meta);
}

export function useProgress() {
  return { progress, meta, storageBackend, ready, init, refreshMetaIfStale, gradeCard, resetAll };
}

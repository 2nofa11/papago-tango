import { computed, reactive, ref } from "vue";
import { VOCAB } from "../data/vocab";
import { buildSession, filterPool } from "../lib/session";
import { boxCounts, cardKey } from "../lib/srs";
import { useProgress } from "./useProgress";
import { useSettings } from "./useSettings";
import type { Mode, RangeKey, Word } from "../types";

export type Screen = "menu" | "session" | "summary";

// Shared session/quiz state — mirrors the original app's top-level `uiMode`,
// `uiRange`, `session`, `sIndex`, `flipped`, `sCorrect`, `sWrong` globals.
const screen = ref<Screen>("menu");
const uiMode = ref<Mode>("F1");
const uiRange = ref<RangeKey>("all");
const session = reactive<Word[]>([]);
const sIndex = ref(0);
const flipped = ref(false);
const sCorrect = ref(0);
const sWrong = ref(0);

const currentWord = computed<Word | undefined>(() => session[sIndex.value]);

function menuStats() {
  const { progress, meta, refreshMetaIfStale } = useProgress();
  const { getNewPerDay } = useSettings();
  refreshMetaIfStale();
  const pool = filterPool(VOCAB, progress, uiRange.value, uiMode.value);
  const now = Date.now();
  let due = 0;
  let fresh = 0;
  let mastered = 0;
  for (const w of pool) {
    const rec = progress[cardKey(w, uiMode.value)];
    if (!rec) fresh++;
    else if (rec.mastered) mastered++;
    else if (rec.next <= now) due++;
  }
  const newAvailable = Math.min(fresh, Math.max(0, getNewPerDay() - meta.count));
  return {
    due,
    newAvailable,
    mastered,
    poolLength: pool.length,
    startDisabled: due === 0 && fresh === 0,
  };
}

function shelfCounts() {
  const { progress } = useProgress();
  const pool = filterPool(
    VOCAB,
    progress,
    uiRange.value === "weak" ? "all" : uiRange.value,
    uiMode.value,
  );
  return boxCounts(progress, uiMode.value, pool);
}

function start() {
  const { progress, meta } = useProgress();
  const { getNewPerDay, getReviewCap, sessionSize } = useSettings();
  const built = buildSession(
    VOCAB,
    progress,
    meta,
    uiMode.value,
    uiRange.value,
    sessionSize.value,
    getNewPerDay(),
    getReviewCap(),
  );
  if (built.session.length === 0) return;
  session.splice(0, session.length, ...built.session);
  sIndex.value = 0;
  sCorrect.value = 0;
  sWrong.value = 0;
  flipped.value = false;
  screen.value = "session";
}

function flip() {
  flipped.value = true;
}

function judge(correct: boolean) {
  const w = currentWord.value;
  if (!flipped.value || !w) return;
  const { gradeCard } = useProgress();
  gradeCard(w, uiMode.value, correct);
  if (correct) sCorrect.value++;
  else sWrong.value++;
  sIndex.value++;
  if (sIndex.value >= session.length) {
    screen.value = "summary";
  } else {
    flipped.value = false;
  }
}

function abortSession() {
  screen.value = "menu";
}

/** Asks for confirmation (matching the original app's native confirm()
 * dialog) before abandoning the in-progress session. Used by both the ✕
 * button and the Escape key shortcut. */
function requestAbort() {
  if (confirm("セッションを中断してメニューに戻りますか？（ここまでの結果は保存されます）"))
    abortSession();
}

function backToMenu() {
  screen.value = "menu";
}

export function useSession() {
  return {
    screen,
    uiMode,
    uiRange,
    session,
    sIndex,
    flipped,
    sCorrect,
    sWrong,
    currentWord,
    vocab: VOCAB,
    menuStats,
    shelfCounts,
    start,
    flip,
    judge,
    abortSession,
    requestAbort,
    backToMenu,
  };
}

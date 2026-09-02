import type { Meta, Mode, Progress, RangeKey, Word } from "../types";
import { cardKey } from "./srs";

// FILTERING & SESSION BUILDING — ported verbatim from the original
// single-file app. Range key strings must stay in sync with the chip
// data-range values used in MenuScreen.vue.
export function filterPool(
  vocab: Word[],
  progress: Progress,
  rangeKey: RangeKey,
  mode: Mode,
): Word[] {
  if (rangeKey === "1-13") return vocab.filter((w) => w.l <= 13);
  if (rangeKey === "14-25") return vocab.filter((w) => w.l >= 14 && w.l <= 25);
  if (rangeKey === "26-38") return vocab.filter((w) => w.l >= 26 && w.l <= 38);
  if (rangeKey === "39-54") return vocab.filter((w) => w.l >= 39 && w.l <= 54);
  if (rangeKey === "55-56") return vocab.filter((w) => w.l >= 55);
  if (rangeKey === "weak") {
    return vocab.filter((w) => {
      const rec = progress[cardKey(w, mode)];
      return rec && !rec.mastered && rec.box <= 2;
    });
  }
  return vocab;
}

export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function avoidTripleLesson(list: Word[]): Word[] {
  const out = [...list];
  for (let i = 2; i < out.length; i++) {
    if (out[i].l === out[i - 1].l && out[i - 1].l === out[i - 2].l) {
      for (let j = i + 1; j < out.length; j++) {
        if (out[j].l !== out[i - 1].l) {
          [out[i], out[j]] = [out[j], out[i]];
          break;
        }
      }
    }
  }
  return out;
}

export interface BuiltSession {
  session: Word[];
  dueCount: number;
  freshAvailable: number;
  remainingNew: number;
}

export function buildSession(
  vocab: Word[],
  progress: Progress,
  meta: Meta,
  mode: Mode,
  rangeKey: RangeKey,
  sessionSize: number,
  newPerDay: number,
  reviewCap: number,
): BuiltSession {
  const pool = filterPool(vocab, progress, rangeKey, mode);
  const now = Date.now();
  const due: { w: Word; rec: { next: number } }[] = [];
  const fresh: Word[] = [];
  for (const w of pool) {
    const rec = progress[cardKey(w, mode)];
    if (!rec) fresh.push(w);
    else if (!rec.mastered && rec.next <= now) due.push({ w, rec });
  }
  due.sort((a, b) => a.rec.next - b.rec.next);
  const reviews = due.slice(0, reviewCap).map((d) => d.w);
  const remainingNew = Math.max(0, newPerDay - meta.count);
  shuffle(fresh);
  const newSlots = Math.max(0, sessionSize - Math.min(reviews.length, sessionSize));
  const news = fresh.slice(0, Math.min(remainingNew, newSlots));
  let combo = shuffle(reviews.slice(0, sessionSize).concat(news)).slice(0, sessionSize);
  combo = avoidTripleLesson(combo);
  return { session: combo, dueCount: due.length, freshAvailable: fresh.length, remainingNew };
}

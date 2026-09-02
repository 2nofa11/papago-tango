import type { Meta, Mode, Progress, Word } from "../types";

// LEITNER SCHEDULING — ported verbatim from the original single-file app.
// Box 1 = 10 minutes, then 1/3/7/16/35/70 days. These numbers must not
// change: existing users' saved `next` timestamps were computed against them.
export const BOX_DAYS: Record<number, number> = {
  1: 10 / 1440,
  2: 1,
  3: 3,
  4: 7,
  5: 16,
  6: 35,
  7: 70,
};

export function nextTime(days: number): number {
  return Date.now() + days * 86400000;
}

export function formatInterval(days: number): string {
  return days < 1 ? `${Math.round(days * 1440)}分` : `${Math.round(days)}日`;
}

/** Progress record key. Must stay byte-identical to the legacy format so
 * existing saved progress (keyed on this string) keeps matching. */
export function cardKey(w: Word, mode: Mode): string {
  return `${w.h}|${w.p}#${mode}`;
}

/** Grades a card and returns the updated progress/meta. Caller is
 * responsible for persisting (saveProgress/saveMeta) and updating reactive
 * state — this function stays pure so it's easy to unit test. */
export function gradeCard(
  progress: Progress,
  meta: Meta,
  w: Word,
  mode: Mode,
  correct: boolean,
): { progress: Progress; meta: Meta } {
  const k = cardKey(w, mode);
  let rec = progress[k];
  let count = meta.count;
  if (!rec) {
    rec = correct
      ? { box: 4, next: nextTime(BOX_DAYS[4]), seenCorrectStreak: 0, mastered: false }
      : { box: 1, next: nextTime(BOX_DAYS[1]), seenCorrectStreak: 0, mastered: false };
    count++;
  } else {
    rec = { ...rec };
    if (correct) {
      if (rec.box >= 7) {
        rec.seenCorrectStreak = (rec.seenCorrectStreak || 0) + 1;
        if (rec.seenCorrectStreak >= 2) rec.mastered = true;
        rec.next = nextTime(BOX_DAYS[7]);
      } else {
        rec.box = rec.box + 1;
        rec.seenCorrectStreak = 0;
        rec.next = nextTime(BOX_DAYS[rec.box]);
      }
    } else {
      rec.box = 1;
      rec.seenCorrectStreak = 0;
      rec.mastered = false;
      rec.next = nextTime(BOX_DAYS[1]);
    }
  }
  return {
    progress: { ...progress, [k]: rec },
    meta: { ...meta, count },
  };
}

export interface BoxCounts {
  0: number;
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  7: number;
  mastered: number;
}

export function boxCounts(progress: Progress, mode: Mode, pool: Word[]): BoxCounts {
  const counts: BoxCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, mastered: 0 };
  for (const w of pool) {
    const rec = progress[cardKey(w, mode)];
    if (!rec) counts[0]++;
    else if (rec.mastered) counts.mastered++;
    else counts[rec.box as keyof Omit<BoxCounts, "mastered">]++;
  }
  return counts;
}

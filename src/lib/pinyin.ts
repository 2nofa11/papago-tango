// TONE COLOR (approximate: colors the toned vowel only) — same table as the
// original single-file app. In the Vue version this returns structured data
// instead of an HTML string, so templates can render it with v-for instead
// of v-html (see AnswerBlock.vue / FlashCard.vue).
const TONE_TABLE: Record<number, string[]> = {
  1: ["ā", "ē", "ī", "ō", "ū", "ǖ"],
  2: ["á", "é", "í", "ó", "ú", "ǘ"],
  3: ["ǎ", "ě", "ǐ", "ǒ", "ǔ", "ǚ"],
  4: ["à", "è", "ì", "ò", "ù", "ǜ"],
};

export function toneOf(ch: string): number | null {
  for (const t in TONE_TABLE) {
    if (TONE_TABLE[t].includes(ch)) return Number(t);
  }
  return null;
}

export interface PinyinChar {
  char: string;
  tone: number | null;
}

export function splitPinyin(py: string): PinyinChar[] {
  return Array.from(py, (char) => ({ char, tone: toneOf(char) }));
}

export interface ExampleHighlight {
  before: string;
  match: string;
  after: string;
}

/** Splits a hanzi sentence around the first occurrence of `target`, for
 * highlighting the current word inside its example sentence. */
export function splitExample(hanziSentence: string, target: string): ExampleHighlight {
  if (!hanziSentence) return { before: "", match: "", after: "" };
  const idx = hanziSentence.indexOf(target);
  if (idx < 0) return { before: hanziSentence, match: "", after: "" };
  return {
    before: hanziSentence.slice(0, idx),
    match: target,
    after: hanziSentence.slice(idx + target.length),
  };
}

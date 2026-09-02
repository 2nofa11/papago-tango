export type Mode = "F1" | "F2";

export type RangeKey = "all" | "1-13" | "14-25" | "26-38" | "39-54" | "55-56" | "weak";

export interface Word {
  h: string;
  p: string;
  m: string;
  l: number;
  /** [漢字例文, ピンイン例文, 日本語訳?] — 日本語訳が無い語もある */
  e: [string, string] | [string, string, string];
  /** 用法メモ（主に量詞の使用例） */
  n?: string;
  /** この語が登場する他のレッスン番号（現状 UI からは未参照だが元データを保持） */
  also?: number[];
}

export interface ProgressRecord {
  box: number;
  next: number;
  seenCorrectStreak: number;
  mastered: boolean;
}

export type Progress = Record<string, ProgressRecord>;

export interface Meta {
  date: string;
  count: number;
}

export type StorageBackend = "artifact" | "local" | "memory";

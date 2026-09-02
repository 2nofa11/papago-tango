import type { Word } from "../types";

// One file per lesson (lesson-01.json … lesson-56.json). Adding a word means
// editing/adding a single small JSON file — no more scrolling a 12,000-line
// template literal inside index.html.
const modules = import.meta.glob<Word[]>("./lessons/*.json", {
  eager: true,
  import: "default",
});

export const VOCAB: Word[] = Object.keys(modules)
  .sort()
  .flatMap((key) => modules[key]);

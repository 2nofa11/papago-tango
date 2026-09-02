// One-off migration script: extract VOCAB from the legacy single-file app's
// template-literal JSON.parse block into per-lesson JSON files under
// src/data/lessons/. Kept for provenance/re-run if index.html.legacy is ever
// revisited; the app itself reads from src/data/lessons/*.json via vocab.ts.
//
// The block is NOT plain JSON (it contains double-escaped sequences like \"),
// so we must evaluate it as JS, not JSON.parse the raw slice.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const htmlPath = path.join(root, "index.html.legacy");
const outDir = path.join(root, "src/data/lessons");

const lines = fs.readFileSync(htmlPath, "utf8").split("\n");
// lines are 1-indexed in the editor; VOCAB decl starts at line 458, JSON.parse closes at 12909
const block = lines.slice(457, 12909).join("\n");
// oxlint-disable-next-line no-implied-eval -- trusted local migration input, one-off script
const VOCAB = new Function(`${block}\nreturn VOCAB;`)();

if (VOCAB.length !== 1143) {
  throw new Error(`expected 1143 words, got ${VOCAB.length}`);
}

// Validate schema before writing anything
const allowedFields = new Set(["h", "p", "m", "l", "e", "n", "also"]);
for (const w of VOCAB) {
  for (const k of Object.keys(w)) {
    if (!allowedFields.has(k)) throw new Error(`unexpected field "${k}" on ${JSON.stringify(w)}`);
  }
  if (typeof w.h !== "string" || typeof w.p !== "string" || typeof w.m !== "string") {
    throw new Error(`bad types: ${JSON.stringify(w)}`);
  }
  if (!Number.isInteger(w.l) || w.l < 1 || w.l > 56)
    throw new Error(`bad lesson: ${JSON.stringify(w)}`);
  if (!Array.isArray(w.e) || (w.e.length !== 2 && w.e.length !== 3)) {
    throw new Error(`bad e: ${JSON.stringify(w)}`);
  }
}

// Duplicate cardKey check (h|p must be unique — cardKey() depends on it)
const keys = new Set();
for (const w of VOCAB) {
  const k = `${w.h}|${w.p}`;
  if (keys.has(k)) throw new Error(`duplicate h|p: ${k}`);
  keys.add(k);
}

// Group by lesson, preserving each word object verbatim (field order as-authored)
const byLesson = new Map();
for (const w of VOCAB) {
  if (!byLesson.has(w.l)) byLesson.set(w.l, []);
  byLesson.get(w.l).push(w);
}

fs.mkdirSync(outDir, { recursive: true });
let written = 0;
for (let l = 1; l <= 56; l++) {
  const words = byLesson.get(l);
  if (!words || words.length === 0) continue;
  const file = path.join(outDir, `lesson-${String(l).padStart(2, "0")}.json`);
  fs.writeFileSync(file, `${JSON.stringify(words, null, 2)}\n`);
  written += words.length;
}

if (written !== VOCAB.length) {
  throw new Error(`written ${written} words but VOCAB has ${VOCAB.length}`);
}

console.log(
  `extracted ${VOCAB.length} words into ${byLesson.size} lesson files under ${path.relative(root, outDir)}/`,
);

// Stash the original-order extraction for the round-trip test to compare against
fs.mkdirSync(path.join(root, "scripts/.tmp"), { recursive: true });
fs.writeFileSync(path.join(root, "scripts/.tmp/vocab-original.json"), JSON.stringify(VOCAB));

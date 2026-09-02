import type { Meta, Progress, StorageBackend } from "../types";

// STORAGE ADAPTER — tries artifact storage, falls back to localStorage, then
// in-memory. Backend is detected once at startup with a real read/write test
// (not just typeof checks), because window.storage can exist but still fail
// depending on how this app is being rendered (in-chat artifact vs. opened
// as a plain file vs. embedded preview vs. deployed to GitHub Pages).
//
// Ported verbatim from the original single-file app (see index.html.legacy)
// to keep the localStorage key format ('papago:'+key) byte-for-byte
// compatible with existing users' saved progress.

interface ArtifactStorage {
  set: (key: string, value: string, sync?: boolean) => Promise<void>;
  get: (key: string, sync?: boolean) => Promise<{ value: string } | null>;
  delete?: (key: string, sync?: boolean) => Promise<void>;
}

declare global {
  interface Window {
    storage?: ArtifactStorage;
  }
}

export let storageBackend: StorageBackend = "memory";
const memStore: Record<string, unknown> = {};

async function detectStorageBackend(): Promise<StorageBackend> {
  // 1) artifact persistent storage
  if (window.storage && typeof window.storage.set === "function") {
    try {
      await window.storage.set("__probe__", JSON.stringify({ ok: true }), false);
      const r = await window.storage.get("__probe__", false);
      if (r && JSON.parse(r.value).ok) {
        try {
          await window.storage.delete?.("__probe__", false);
        } catch {
          // ignore cleanup failure
        }
        return "artifact";
      }
    } catch (e) {
      console.warn("artifact storage unavailable, trying localStorage", e);
    }
  }
  // 2) localStorage (works when this app is opened directly, or in a
  //    same-origin preview without the artifact storage bridge)
  try {
    localStorage.setItem("__probe__", "1");
    localStorage.removeItem("__probe__");
    return "local";
  } catch (e) {
    console.warn("localStorage unavailable, using in-memory only", e);
  }
  // 3) memory (progress will not survive a page reload)
  return "memory";
}

export type StorageBadgeListener = (backend: StorageBackend) => void;
let onBackendChange: StorageBadgeListener | null = null;
export function setStorageBadgeListener(fn: StorageBadgeListener | null) {
  onBackendChange = fn;
}

const Store = {
  async get<T>(key: string, fallback: T): Promise<T> {
    try {
      if (storageBackend === "artifact") {
        const r = await window.storage?.get(key, false);
        return r ? (JSON.parse(r.value) as T) : fallback;
      }
      if (storageBackend === "local") {
        const raw = localStorage.getItem(`papago:${key}`);
        return raw ? (JSON.parse(raw) as T) : fallback;
      }
      return key in memStore ? (memStore[key] as T) : fallback;
    } catch (e) {
      console.warn("storage read failed", e);
      return fallback;
    }
  },
  async set(key: string, value: unknown): Promise<void> {
    try {
      if (storageBackend === "artifact") {
        await window.storage?.set(key, JSON.stringify(value), false);
      } else if (storageBackend === "local") {
        localStorage.setItem(`papago:${key}`, JSON.stringify(value));
      } else {
        memStore[key] = value;
      }
    } catch (e) {
      console.warn("storage save failed, downgrading backend", e);
      // downgrade one tier and retry once, so a mid-session failure (e.g. the
      // artifact bridge dropping out) doesn't silently lose data
      if (storageBackend === "artifact") {
        storageBackend = "local";
        return Store.set(key, value);
      }
      if (storageBackend === "local") {
        storageBackend = "memory";
        memStore[key] = value;
      }
      onBackendChange?.(storageBackend);
    }
  },
};

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function loadState(): Promise<{ progress: Progress; meta: Meta }> {
  storageBackend = await detectStorageBackend();
  onBackendChange?.(storageBackend);
  const progress = await Store.get<Progress>("progress", {});
  const meta = await Store.get<Meta>("meta", { date: "", count: 0 });
  return { progress, meta: ensureMetaFresh(meta) };
}

export function saveProgress(progress: Progress): void {
  void Store.set("progress", progress);
}
export function saveMeta(meta: Meta): void {
  void Store.set("meta", meta);
}

/** Returns a fresh meta object if the day has rolled over; otherwise the input unchanged. */
export function ensureMetaFresh(meta: Meta): Meta {
  if (meta.date !== todayStr()) {
    const fresh = { date: todayStr(), count: 0 };
    saveMeta(fresh);
    return fresh;
  }
  return meta;
}

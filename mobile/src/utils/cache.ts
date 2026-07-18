import AsyncStorage from "@react-native-async-storage/async-storage";

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
}

export async function readCache<T>(
  key: string,
  ttlMs: number
): Promise<{ data: T; isStale: boolean } | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    return { data: entry.data, isStale: Date.now() - entry.cachedAt > ttlMs };
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, data: T): void {
  AsyncStorage.setItem(key, JSON.stringify({ data, cachedAt: Date.now() })).catch(() => {});
}

const CACHE_KEYS = [
  "taxpadi:transactions",
  "taxpadi:payments",
  "taxpadi:invoices",
  "taxpadi:deadlines",
  "taxpadi:savings",
  "taxpadi:tax-liability",
];

export async function clearAllCaches(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(CACHE_KEYS);
  } catch {}
}

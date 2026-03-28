/**
 * Remove all keys with `undefined` values from an object.
 * Firestore rejects `undefined` — this must be called before every write.
 */
export function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as T;
}

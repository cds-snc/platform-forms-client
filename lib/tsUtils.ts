export function hasOwnProperty<X extends Record<string, unknown>, Y extends PropertyKey>(
  obj: X,
  prop: Y
): obj is X & Record<Y, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

export const isServer = (): boolean => {
  return typeof window === "undefined";
};

export function filterUndef<T>(ts: (T | undefined)[]): T[] {
  return ts.filter((t: T | undefined): t is T => !!t);
}

export function safeJSONParseM<T>(args: Parameters<typeof JSON.parse>): T | undefined {
  try {
    return JSON.parse(...args);
  } catch (e) {
    return undefined;
  }
}

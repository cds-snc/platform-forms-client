import { twMerge } from "tailwind-merge";
import { clsx, ClassValue } from "clsx";

export function chunkArray<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLocalizedProperty(field = "", lang = "en"): string {
  return field + lang.charAt(0).toUpperCase() + lang.slice(1);
}

export function dateHasPast(timestamp: number) {
  // Get the current time in UTC
  const now = new Date();

  // Compare utc time to timestamp
  if (now.getTime() > timestamp) {
    return true;
  }

  return false;
}

export function safeJSONParse<T>(...args: Parameters<typeof JSON.parse>): T | undefined {
  try {
    return JSON.parse(...args);
  } catch (e) {
    // Note: SyntaxError is the only error thrown by JSON.parse(). More info on specific errors:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/JSON_bad_parse

    // Why not just throw the error? NextJS will give an error about a non plain-object crossing
    // the server/client boundary.
    return undefined;
  }
}

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

/* eslint-disable @typescript-eslint/no-explicit-any */
export function safeJSONParse(
  rawJSON: string,
  reviver?: ((this: any, key: string, value: any) => any) | undefined
): any {
  try {
    if (reviver && typeof reviver === "function") {
      return JSON.parse(rawJSON, reviver);
    }
    return JSON.parse(rawJSON);
  } catch (e) {
    // Note: SyntaxError is the only error thrown by JSON.parse(). More info on specific errors:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/JSON_bad_parse
    if (e instanceof SyntaxError) {
      // Why not just throw the error? NextJS will give an error about a non plain-object crossing
      // the server/client boundary.
      return { error: "JSON parse syntaxt error" };
    }
    return { error: "JSON parse error" }; // This should never happen but just encase
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function safeJSONStringify(
  value: any,
  replacer?: ((this: any, key: string, value: any) => any) | undefined,
  space?: string | number | undefined
): string | { error: string } {
  try {
    // Note: JSON.stringify will ignore a replacer if it's not a function and space if it's not a
    // string or number.
    return JSON.stringify(value, replacer, space);
  } catch (e) {
    // Note: TypeError is the only error thrown by JSON.stringify()
    if (e instanceof TypeError) {
      return { error: "JSON stringify type error" };
    }
    return { error: "JSON stringify error" }; // This should never happen but just encase
  }
}

// Note: Using JSON to deep coopy works but may not be very performant. If we find many of our users
// are using pre 2022 browsers, there are libs that should do more performant recursive deep copies.
// More testing is needed to see what browser versions our users are using and if recursively
// copying an object is really more performant than a JSON copy with our typical data.
function legacyDeepCopy<T>(obj: T): T | { error: string } {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    return { error: "legacyDeepCopy failed with JSON error" };
  }
}

export function deepCopy<T>(obj: T): T | { error: string } {
  // Note: structuredClone is supported in modern browsers (around 2022) and Node.js v17.0.0 and
  // above. So a check with a fallback to a legacy deep copy is still a good idea.
  if (typeof structuredClone !== "function") {
    return legacyDeepCopy(obj);
  }

  // Note: deepCopy can only convert serializable objects. So any functions/* will be lost in the
  // process. Also, unlike JSON.stringify it can handle bigInts.
  try {
    return structuredClone(obj);
  } catch (e) {
    return { error: "deepCopy failed with structured clone error" };
  }
}

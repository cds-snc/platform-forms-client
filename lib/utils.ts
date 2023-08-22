import { twMerge } from "tailwind-merge";
import { clsx, ClassValue } from "clsx";
import { logMessage } from "./logger";

export function chunkArray<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This function is used for the i18n change of form labels
export function getProperty(field: string, lang: string): string {
  try {
    if (!field) {
      return lang;
    }
    return field + lang.charAt(0).toUpperCase() + lang.slice(1);
  } catch (err) {
    logMessage.error(err as Error);
    throw err;
  }
}

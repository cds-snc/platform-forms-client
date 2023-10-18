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

  // Get the local timezone offset in minutes
  const timezoneOffset = now.getTimezoneOffset();

  // Convert the timestamp to a Date object
  const date = new Date(timestamp);

  // Adjust the timestamp for the local timezone
  const localTimestamp = new Date(date.getTime() - timezoneOffset * 60 * 1000);

  // Compare the local timestamp to the current time in UTC
  if (localTimestamp.getTime() < now.getTime()) {
    return true;
  }

  return false;
}

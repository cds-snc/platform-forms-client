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

export const deepStringify = <T>(obj: T): string => {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "object" && value !== null) {
      return deepStringify(value);
    }
    return value;
  });
};

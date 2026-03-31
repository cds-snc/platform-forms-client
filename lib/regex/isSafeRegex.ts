import { checkSync } from "recheck";

export const isSafeRegex = (pattern: string): boolean => {
  if (!pattern) return true;

  const result = checkSync(pattern, "", { timeout: 1000 });
  return result.status === "safe";
};

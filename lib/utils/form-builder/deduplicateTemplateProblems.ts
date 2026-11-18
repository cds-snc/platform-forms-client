import type { TemplateValidationProblem } from "./validate";

export const deduplicateTemplateProblems = <T extends TemplateValidationProblem>(
  problems: T[]
): T[] => {
  const seen = new Set<string>();
  return problems.filter(({ path, name, message }) => {
    const key = JSON.stringify([path.replace(/\[(\d+)\]/g, ".$1"), name, message]);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

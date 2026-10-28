import { type TemplateMigrationProblem } from "@lib/templates/schemaVersioning/getTemplateMigrationProblems";

export type ProblemElement = {
  properties?: {
    titleEn?: string;
    titleFr?: string;
    choices?: unknown[];
    subElements?: ProblemElement[];
  };
};

const duplicateChoices = (choices: unknown[] | undefined, lang: string): string[] => {
  if (!choices) return [];
  const duplicates = new Set<string>();
  const seen = new Set<string>();
  for (const choice of choices) {
    const key = JSON.stringify(choice);
    if (seen.has(key)) {
      const label =
        typeof choice === "object" && choice !== null
          ? (choice as Record<string, unknown>)[lang]
          : choice;
      duplicates.add(typeof label === "string" && label ? label : String(choice));
    }
    seen.add(key);
  }
  return [...duplicates];
};

export const describeMigrationProblem = (
  problem: TemplateMigrationProblem,
  element: ProblemElement | undefined,
  lang: string,
  t: (key: string, options?: Record<string, unknown>) => string
) => {
  if (problem.name === "uniqueItems" && problem.path.endsWith(".choices")) {
    const duplicates = duplicateChoices(element?.properties?.choices, lang);
    if (duplicates.length) {
      return t("migrationProblems.duplicateChoices", { choices: duplicates.join(", ") });
    }
  }
  if (problem.name === "uniqueItems" && problem.path.endsWith(".conditionalRules")) {
    return t("migrationProblems.duplicateRules");
  }

  const field =
    (problem.name === "required"
      ? problem.message.match(/requires property ["']([^"']+)["']/)?.[1]
      : undefined) ??
    problem.path.split(".").at(-1) ??
    "";
  const fieldLabel = [
    "choices",
    "conditionalRules",
    "titleEn",
    "titleFr",
    "validation",
    "subElements",
  ].includes(field)
    ? t(`migrationProblems.fields.${field}`)
    : field;
  if (problem.name === "minItems") return t("migrationProblems.emptyList", { field: fieldLabel });
  if (problem.name === "maxItems") return t("migrationProblems.tooMany", { field: fieldLabel });
  if (problem.name === "pattern")
    return t("migrationProblems.invalidFormat", { field: fieldLabel });
  if (problem.name === "required")
    return t("migrationProblems.required", { field: fieldLabel || t("migrationProblems.field") });
  if (problem.name === "migration") return t("migrationProblems.cannotUpgrade");
  return t("migrationProblems.invalid", {
    field: fieldLabel || t("migrationProblems.field"),
    detail: problem.message,
  });
};

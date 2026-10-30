import { type TemplateMigrationProblem } from "@lib/templates/schemaVersioning/getTemplateMigrationProblems";
import {
  getDuplicateChoiceIndexes,
  getLocalizedLabel,
  getProblemField,
  isDuplicateChoicesProblem,
  type ProblemElement,
} from "@lib/templates/schemaVersioning/migrationProblemHelpers";

const duplicateChoiceLabels = (choices: unknown[] | undefined, lang: string): string[] => [
  ...new Set(
    getDuplicateChoiceIndexes(choices).map(
      (index) => getLocalizedLabel(choices?.[index], lang) ?? String(choices?.[index])
    )
  ),
];

export const describeMigrationProblem = (
  problem: TemplateMigrationProblem,
  element: ProblemElement | undefined,
  lang: string,
  t: (key: string, options?: Record<string, unknown>) => string
) => {
  if (isDuplicateChoicesProblem(problem)) {
    const duplicates = duplicateChoiceLabels(element?.properties?.choices, lang);
    if (duplicates.length) {
      return t("migrationProblems.duplicateChoices", { choices: duplicates.join(", ") });
    }
  }
  if (problem.name === "uniqueItems" && problem.path.endsWith(".conditionalRules")) {
    return t("migrationProblems.duplicateRules");
  }

  const field = getProblemField(problem) ?? "";
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

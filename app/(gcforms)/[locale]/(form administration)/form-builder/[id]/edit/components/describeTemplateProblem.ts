import { type TemplateValidationProblem } from "@lib/utils/form-builder/validate";
import { type TemplateMigrationProblem } from "@lib/templates/schemaVersioning/getTemplateMigrationProblems";
import {
  getDuplicateChoiceIndexes,
  isDuplicateChoicesProblem,
  type ProblemElement,
} from "@lib/templates/schemaVersioning/migrationProblemHelpers";

export const describeTemplateProblem = (
  problem: TemplateValidationProblem | TemplateMigrationProblem,
  element: ProblemElement | undefined,
  t: (key: string, options?: Record<string, unknown>) => string
) => {
  if (problem.name === "template") return t(problem.message);
  if (problem.name === "schema") return t(problem.message, { property: problem.path });
  if (
    isDuplicateChoicesProblem(problem) &&
    getDuplicateChoiceIndexes(element?.properties?.choices).length
  ) {
    return t("migrationProblems.duplicateChoices");
  }
  if (problem.name === "uniqueItems" && problem.path.endsWith(".conditionalRules")) {
    return t("migrationProblems.duplicateRules");
  }
  if (problem.name === "minItems") return t("migrationProblems.emptyList");
  if (problem.name === "maxItems") return t("migrationProblems.tooMany");
  if (problem.name === "pattern") return t("migrationProblems.invalidFormat");
  if (problem.name === "required") return t("migrationProblems.required");
  if (problem.name === "migration") return t("migrationProblems.cannotUpgrade");
  return t("migrationProblems.invalid", { detail: problem.message });
};

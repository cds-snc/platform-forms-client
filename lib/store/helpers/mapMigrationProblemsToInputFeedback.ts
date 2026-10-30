import type { FormElement, FormProperties } from "@lib/types";
import type { TemplateMigrationProblem } from "@lib/templates/schemaVersioning/getTemplateMigrationProblems";
import {
  getDuplicateChoiceIndexes,
  getLocalizedLabel,
  getProblemElement,
  getProblemField,
  isDuplicateChoicesProblem,
} from "@lib/templates/schemaVersioning/migrationProblemHelpers";
import type { InputFeedbackEntry } from "../types";

export const mapMigrationProblemsToInputFeedback = (
  form: FormProperties,
  problems: TemplateMigrationProblem[],
  language: string,
  t: (key: string, options?: Record<string, unknown>) => string
): Record<string, InputFeedbackEntry> => {
  const feedback: Record<string, InputFeedbackEntry> = {};
  problems.forEach((problem) => {
    const element = getProblemElement<FormElement>(form.elements, problem.path);
    if (!element) return;

    if (isDuplicateChoicesProblem(problem)) {
      const choices = element.properties.choices;
      getDuplicateChoiceIndexes(choices).forEach((index) => {
        const inputId = `option--${element.id}--${index + 1}`;
        if (feedback[inputId]?.state === "error") return;
        feedback[inputId] = {
          state: "conflict",
          message: t("migrationProblems.duplicateChoices", {
            choices: getLocalizedLabel(choices?.[index], language),
          }),
        };
      });
      return;
    }

    const path = problem.path.replace(/\[(\d+)\]/g, ".$1");
    const currentTitle = language === "fr" ? "titleFr" : "titleEn";
    const choiceIndex = path.match(/\.choices\.(\d+)(?:\.|$)/)?.[1];
    const choiceLanguage = path.match(/\.choices\.\d+\.(en|fr)$/)?.[1];
    const inputId =
      getProblemField(problem) === currentTitle
        ? `item-${element.id}`
        : choiceIndex !== undefined && (!choiceLanguage || choiceLanguage === language)
          ? `option--${element.id}--${Number(choiceIndex) + 1}`
          : undefined;
    if (!inputId) return;
    feedback[inputId] = {
      state: "error",
      message:
        problem.name === "required"
          ? t("migrationProblems.required", { field: t("migrationProblems.field") })
          : t("migrationProblems.invalid", {
              field: t("migrationProblems.field"),
              detail: problem.message,
            }),
    };
  });
  return feedback;
};

import type { FormElement, FormProperties } from "@lib/types";
import type { TemplateValidationProblem } from "@lib/utils/form-builder/validate";
import {
  getDuplicateChoiceIndexes,
  getProblemElement,
  getProblemField,
  isDuplicateChoicesProblem,
} from "@lib/templates/schemaVersioning/migrationProblemHelpers";
import type { InputFeedbackEntry } from "../types";
import type { Language } from "@lib/types/form-builder-types";
import { getInputFeedbackKey } from "./getInputFeedbackKey";

export const mapMigrationProblemsToInputFeedback = (
  form: FormProperties,
  problems: TemplateValidationProblem[],
  language: Language,
  t: (key: string, options?: Record<string, unknown>) => string
): Record<string, InputFeedbackEntry> => {
  const feedback: Record<string, InputFeedbackEntry> = {};
  problems.forEach((problem) => {
    const element = getProblemElement<FormElement>(form.elements, problem.path);
    if (!element) return;

    if (isDuplicateChoicesProblem(problem)) {
      const choices = element.properties.choices;
      getDuplicateChoiceIndexes(choices).forEach((index) => {
        const key = getInputFeedbackKey(`option--${element.id}--${index + 1}`, language);
        if (feedback[key]?.state === "error") return;
        feedback[key] = {
          state: "error",
          message: t("duplicateChoice"),
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
    feedback[getInputFeedbackKey(inputId, language)] = {
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

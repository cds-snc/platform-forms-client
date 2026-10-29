import isEqual from "lodash.isequal";
import type { FormElement, FormProperties } from "@lib/types";
import type { TemplateMigrationProblem } from "@lib/templates/schemaVersioning/getTemplateMigrationProblems";
import type { InputFeedbackEntry } from "../types";

export const mapMigrationProblemsToInputFeedback = (
  form: FormProperties,
  problems: TemplateMigrationProblem[],
  language: string,
  t: (key: string, options?: Record<string, unknown>) => string
): Record<string, InputFeedbackEntry> => {
  const feedback: Record<string, InputFeedbackEntry> = {};
  problems.forEach((problem) => {
    const path = problem.path?.replace(/\[(\d+)\]/g, ".$1") ?? "";
    const root = path.match(/^elements\.(\d+)/);
    if (!root) return;
    let element: FormElement | undefined = form.elements[Number(root[1])];
    for (const match of path.matchAll(/\.properties\.subElements\.(\d+)/g)) {
      element = element?.properties?.subElements?.[Number(match[1])];
    }
    if (!element) return;

    const choices = element.properties?.choices;
    if (problem.name === "uniqueItems" && path.endsWith(".choices") && Array.isArray(choices)) {
      choices.forEach((choice, index) => {
        if (!choices.some((other, otherIndex) => otherIndex !== index && isEqual(choice, other)))
          return;
        const label = language === "fr" ? choice?.fr || choice?.en : choice?.en || choice?.fr;
        const inputId = `option--${element.id}--${index + 1}`;
        if (feedback[inputId]?.state === "error") return;
        feedback[inputId] = {
          state: "conflict",
          message: t("migrationProblems.duplicateChoices", { choices: label }),
        };
      });
      return;
    }

    const field =
      problem.name === "required"
        ? problem.message.match(/requires property ["']([^"']+)["']/)?.[1]
        : path.split(".").at(-1);
    const currentTitle = language === "fr" ? "titleFr" : "titleEn";
    const choiceIndex = path.match(/\.choices\.(\d+)(?:\.|$)/)?.[1];
    const choiceLanguage = path.match(/\.choices\.\d+\.(en|fr)$/)?.[1];
    const inputId =
      field === currentTitle
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

"use client";
import { useEffect } from "react";
import { useTranslation } from "@i18n/client";
import type { TemplateValidationProblem } from "@lib/utils/form-builder/validate";
import { useTemplateStore } from "../useTemplateStore";
import { mapMigrationProblemsToInputFeedback } from "../helpers/mapMigrationProblemsToInputFeedback";
import { deduplicateTemplateProblems } from "@lib/utils/form-builder/deduplicateTemplateProblems";

export const useMigrationProblemFeedback = (problems: TemplateValidationProblem[]) => {
  const { t } = useTranslation("form-builder");
  const { form, language, setTemplateProblemFeedback } = useTemplateStore((state) => ({
    form: state.form,
    language: state.translationLanguagePriority,
    setTemplateProblemFeedback: state.setTemplateProblemFeedback,
  }));

  useEffect(() => {
    setTemplateProblemFeedback(
      mapMigrationProblemsToInputFeedback(form, deduplicateTemplateProblems(problems), language, t)
    );
  }, [form, problems, language, t, setTemplateProblemFeedback]);

  useEffect(() => () => setTemplateProblemFeedback({}), [setTemplateProblemFeedback]);
};

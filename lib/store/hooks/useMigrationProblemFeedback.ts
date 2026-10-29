"use client";
import { useEffect, useRef } from "react";
import { useTranslation } from "@i18n/client";
import type { TemplateMigrationProblem } from "@lib/templates/schemaVersioning/getTemplateMigrationProblems";
import { useTemplateStore } from "../useTemplateStore";
import type { InputFeedbackEntry } from "../types";
import { mapMigrationProblemsToInputFeedback } from "../helpers/mapMigrationProblemsToInputFeedback";

export const useMigrationProblemFeedback = (problems: TemplateMigrationProblem[]) => {
  const { t } = useTranslation("form-builder");
  const { form, language, setInputFeedback } = useTemplateStore((state) => ({
    form: state.form,
    language: state.translationLanguagePriority,
    setInputFeedback: state.setInputFeedback,
  }));
  const previous = useRef<Record<string, InputFeedbackEntry>>({});

  useEffect(() => {
    const feedback = mapMigrationProblemsToInputFeedback(form, problems, language, t);
    Object.keys(previous.current).forEach((inputId) => {
      if (!feedback[inputId]) setInputFeedback(inputId, null);
    });
    Object.entries(feedback).forEach(([inputId, entry]) => {
      if (
        previous.current[inputId]?.state !== entry.state ||
        previous.current[inputId]?.message !== entry.message
      ) {
        setInputFeedback(inputId, entry);
      }
    });
    previous.current = feedback;
  }, [form, problems, language, t, setInputFeedback]);
};

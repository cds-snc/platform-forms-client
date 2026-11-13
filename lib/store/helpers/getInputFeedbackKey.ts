import type { Language } from "@lib/types/form-builder-types";

export const getInputFeedbackKey = (inputId: string, language: Language) =>
  `${language}:${inputId}`;

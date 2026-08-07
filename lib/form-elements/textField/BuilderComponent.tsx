"use client";

import { useTranslation } from "@i18n/client";
import { ShortAnswer } from "@formBuilder/[id]/edit/components/elements";
import { isNumberInput } from "@gcforms/core";
import type { BuilderProps } from "@lib/form-elements/types";

export const BuilderComponent = ({ item }: BuilderProps) => {
  const { t } = useTranslation("form-builder");
  const validationType = item.properties?.validation?.type;

  // Specialised short-answer sub-types shown in the builder panel
  if (validationType === "email")
    return <ShortAnswer data-testid="email">name@example.com</ShortAnswer>;
  if (validationType === "tel") return <ShortAnswer data-testid="phone">111-222-3333</ShortAnswer>;
  if (isNumberInput(item)) return <ShortAnswer data-testid="number">0123456789</ShortAnswer>;

  return <ShortAnswer>{t("shortAnswerText")}</ShortAnswer>;
};

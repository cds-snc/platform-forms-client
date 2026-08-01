"use client";

import { useTranslation } from "@i18n/client";
import { ShortAnswer } from "@formBuilder/[id]/edit/components/elements";
import type { BuilderProps } from "@lib/form-elements/types";

export const BuilderComponent = (_: BuilderProps) => {
  const { t } = useTranslation("form-builder");
  return <ShortAnswer>{t("longAnswerText")}</ShortAnswer>;
};

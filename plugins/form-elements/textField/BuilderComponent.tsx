"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { ShortAnswer } from "@root/plugins/shared";
import type { BuilderProps } from "../types";

/**
 * Renders the form-builder right-panel preview for a textField element.
 *
 * Handles all textField sub-types (email, phone, date) so that the legacy
 * SelectedElement switch no longer needs to branch on these cases once
 * textField is fully migrated.
 */
export const BuilderComponent = ({ item }: BuilderProps) => {
  const { t } = useTranslation("form-builder");
  const autoComplete = item.properties?.autoComplete;
  const validationType = item.properties?.validation?.type;

  if (autoComplete === "email" || validationType === "email") {
    return <ShortAnswer>name@example.com</ShortAnswer>;
  }

  if (autoComplete === "tel") {
    return <ShortAnswer>111-222-3333</ShortAnswer>;
  }

  // Legacy: "date" was removed from ValidationInputType but may exist in old form data
  if ((validationType as string) === "date") {
    return <ShortAnswer>mm/dd/yyyy</ShortAnswer>;
  }

  return <ShortAnswer>{t("shortAnswerText")}</ShortAnswer>;
};

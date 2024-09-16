"use client";
import React from "react";

import { PanelBody } from ".";
import { FormElementWithIndex, Language } from "@lib/types/form-builder-types";

export const PanelBodySub = ({
  item,
  elIndex,
  onQuestionChange,
  onRequiredChange,
  formId,
}: {
  item: FormElementWithIndex;
  elIndex: number;
  onQuestionChange: (itemId: number, val: string, lang: Language) => void;
  onRequiredChange: (subIndex: number, val: boolean) => void;
  formId: string;
}) => {
  return (
    <PanelBody
      elIndex={elIndex}
      item={item}
      onQuestionChange={onQuestionChange}
      onRequiredChange={onRequiredChange}
      formId={formId}
    />
  );
};

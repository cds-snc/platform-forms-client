"use client";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { FormElementWithIndex, LocalizedElementProperties } from "@lib/types/form-builder-types";
import React from "react";

export const QuestionDescription = ({
  item,
  describedById,
}: {
  item: FormElementWithIndex;
  describedById?: string;
}) => {
  const { localizeField, translationLanguagePriority } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const properties = item.properties;
  const description =
    properties[localizeField(LocalizedElementProperties.DESCRIPTION, translationLanguagePriority)];

  return (
    <>
      {description && (
        <div
          data-testid="description-text"
          className="mt-5 cursor-not-allowed rounded-sm bg-gray-100 p-2 text-slate-600"
          id={describedById}
        >
          {description}
        </div>
      )}
    </>
  );
};

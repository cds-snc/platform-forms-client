"use client";

import { useTemplateStore } from "@lib/store/useTemplateStore";
import { LocalizedElementProperties } from "@lib/types/form-builder-types";

export type ElementProp = {
  type: string;
  titleEn: string;
  titleFr: string;
  descriptionEn: string;
  descriptionFr: string;
};

export const useElementTitle = () => {
  const { translationLanguagePriority, localizeField } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const localizedDescription = localizeField(
    LocalizedElementProperties.DESCRIPTION,
    translationLanguagePriority
  );

  const localizedTitle = localizeField(
    LocalizedElementProperties.TITLE,
    translationLanguagePriority
  );

  const getTitle = (element: ElementProp) => {
    if (element.type === "richText") {
      return element[localizedDescription];
    }

    return element[localizedTitle];
  };

  return { getTitle };
};

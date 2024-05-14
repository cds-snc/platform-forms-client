"use client";

import { useTemplateStore } from "@lib/store/useTemplateStore";
import { LocalizedElementProperties } from "@lib/types/form-builder-types";
import { FormElement } from "@lib/types";

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

  const getTitle = (element: FormElement) => {
    if (element.type === "richText") {
      return element.properties[localizedDescription];
    }

    return element.properties[localizedTitle];
  };
  return getTitle;
};

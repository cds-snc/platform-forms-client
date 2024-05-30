"use client";

import { useTemplateStore } from "@lib/store/useTemplateStore";
import { FormElement } from "@lib/types";
import { LocalizedElementProperties } from "@lib/types/form-builder-types";

export type ElementProperties = {
  name?: string;
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

  const getTitle = (element: ElementProperties | FormElement) => {
    let data = element as ElementProperties;

    // Groups have a name property
    if (data.name) {
      return data.name;
    }

    // Elements have a properties object and type
    if ((element as FormElement).properties) {
      const formElement = element as FormElement;
      data = {
        type: formElement.type,
        titleEn: formElement.properties.titleEn,
        titleFr: formElement.properties.titleFr,
        descriptionEn: formElement.properties.descriptionEn,
        descriptionFr: formElement.properties.descriptionFr,
      } as ElementProperties;
    }

    if (data.type === "richText") {
      return data[localizedDescription];
    }

    return data[localizedTitle];
  };

  return { getTitle };
};

"use client";

import { useLocalize } from "./useLocalize";
import { FormElement } from "@lib/types";

export type ElementProperties = {
  name?: string;
  type: string;
  titleEn: string;
  titleFr: string;
  descriptionEn: string;
  descriptionFr: string;
};

export const useElementTitle = () => {
  const { localizedTitle, localizedDescription } = useLocalize();

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

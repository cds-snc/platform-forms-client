"use client";
import { useCallback, useMemo } from "react";

import { FormElement, FormElementTypes, FormProperties, PropertyChoices } from "@lib/types";
import { Description, publishRequiredFields, Title } from "../../types/form-builder-types";
import { useTemplateStore } from "../../store/useTemplateStore";
import { useAccessControl } from "../useAccessControl";
import { useFormBuilderConfig } from "../useFormBuilderConfig";

export class MissingTranslation extends Error {
  constructor(message?: string) {
    super(message ?? "MissingTranslation");
    Object.setPrototypeOf(this, MissingTranslation.prototype);
  }
}

export const isTitleTranslated = (element: Title) => {
  if (!element.titleEn || !element.titleFr) {
    throw new MissingTranslation();
  }
};

export const isDescriptionTranslated = (element: Description) => {
  if (!element.descriptionEn || !element.descriptionFr) {
    throw new MissingTranslation();
  }
};

export const areChoicesTranslated = (choices: PropertyChoices[]) => {
  choices.forEach((choice) => {
    // ensure choices have a value to be translated
    let empty = false;
    if (choice.en === "" && choice.fr === "") {
      empty = true;
    }

    if (!empty && (!choice.en || !choice.fr)) {
      throw new MissingTranslation();
    }
  });
};

export const isFormElementTranslated = (element: FormElement) => {
  if (element.type === FormElementTypes.richText) {
    isDescriptionTranslated(element.properties);
  } else {
    isTitleTranslated(element.properties);

    // Description is optional
    if (element.properties.descriptionEn || element.properties.descriptionFr) {
      isDescriptionTranslated(element.properties);
    }

    // Only check choices for Select, Radio, and Checkbox
    if (
      [FormElementTypes.checkbox, FormElementTypes.radio, FormElementTypes.dropdown].includes(
        element.type
      )
    ) {
      // Check choices if there are any
      if (element.properties.choices) {
        areChoicesTranslated(element.properties.choices);
      }
    }
  }
};

export const isFormTranslated = (form: FormProperties) => {
  try {
    isTitleTranslated(form);

    // Introduction is optional, but must be translated if present
    if (form.introduction?.descriptionEn || form.introduction?.descriptionFr) {
      isDescriptionTranslated(form.introduction);
    }

    isDescriptionTranslated(form.privacyPolicy ?? {});
    isDescriptionTranslated(form.confirmation ?? {});

    form.elements.forEach((element) => {
      isFormElementTranslated(element);
    });
  } catch (e) {
    return false;
  }

  return true;
};

export const useAllowPublish = () => {
  const { ability } = useAccessControl();
  const { form, formPurpose } = useTemplateStore((s) => ({
    form: s.form,
    formPurpose: s.formPurpose,
  }));

  const userCanPublish = ability?.can("update", "FormRecord", "isPublished");
  const { hasApiKeyId } = useFormBuilderConfig();

  const hasFileInputElement = useMemo(() => {
    // Helper function to recursively check for file input elements
    const checkForFileInput = (elements?: FormElement[]): boolean => {
      if (!elements) return false;

      return elements.some(
        (element) =>
          // Check if the current element is a file input
          element.type === FormElementTypes.fileInput ||
          // Check sub-elements if they exist
          (element.properties?.subElements && checkForFileInput(element.properties.subElements))
      );
    };

    return checkForFileInput(form?.elements);
  }, [form?.elements]);

  // Note the key names here can be anthing but
  // the values must be booleans
  const data = useMemo(
    () => ({
      title: !!form?.titleEn || !!form?.titleFr,
      questions: !!form?.elements?.length,
      privacyPolicy: !!form?.privacyPolicy?.descriptionEn || !!form?.privacyPolicy?.descriptionFr,
      confirmationMessage:
        !!form?.confirmation?.descriptionEn || !!form?.confirmation?.descriptionFr,
      purpose: !!formPurpose,
      translate: isFormTranslated(form),
      hasFileInputAndApiKey: hasFileInputElement ? hasApiKeyId : true,
    }),
    [form, formPurpose, hasApiKeyId, hasFileInputElement]
  );

  const hasData = useCallback(
    (fields: publishRequiredFields[]) => {
      return fields.every(
        (field) => Object.prototype.hasOwnProperty.call(data, field) && data[field] === true
      );
    },
    [data]
  );

  const isPublishable = useCallback(() => {
    const fields = Object.keys(data) as unknown as publishRequiredFields[];
    return hasData(fields);
  }, [data, hasData]);

  return {
    data,
    hasData,
    hasFileInputElement,
    hasApiKeyId,
    isPublishable,
    userCanPublish,
  };
};

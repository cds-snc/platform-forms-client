import { useCallback } from "react";
import {
  Choice,
  Description,
  ElementType,
  FormSchema,
  publishRequiredFields,
  Title,
} from "../types";
import { useAccessControl } from "@lib/hooks";
import { useTemplateStore } from "../store/useTemplateStore";

export class MissingTranslation extends Error {}

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

export const areChoicesTranslated = (choices: Choice[]) => {
  choices.forEach((choice) => {
    if (!choice.en || !choice.fr) {
      throw new MissingTranslation();
    }
  });
};

export const isFormElementTranslated = (element: ElementType) => {
  if (element.type === "richText") {
    isDescriptionTranslated(element.properties);
  } else {
    isTitleTranslated(element.properties);

    // Description is optional
    if (element.properties.descriptionEn || element.properties.descriptionFr) {
      isDescriptionTranslated(element.properties);
    }

    // Check choices if there are any
    if (element.properties.choices) {
      areChoicesTranslated(element.properties.choices);
    }
  }
};

export const isFormTranslated = (form: FormSchema) => {
  try {
    isTitleTranslated(form);

    // Introduction is optional, but must be translated if present
    if (form.introduction.descriptionEn || form.introduction.descriptionFr) {
      isDescriptionTranslated(form.introduction);
    }

    isDescriptionTranslated(form.privacyPolicy);
    isDescriptionTranslated(form.endPage);

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
  const { form, submission } = useTemplateStore((s) => ({
    form: s.form,
    submission: s.submission,
  }));
  let email = "";
  if (submission?.email) {
    email = submission?.email;
  }

  const userCanPublish = ability?.can("update", "FormRecord", "[publishingStatus]");

  const data = {
    title: !!form.titleEn || !!form.titleFr,
    questions: !!form.elements.length,
    privacyPolicy: !!form.privacyPolicy.descriptionEn || !!form.privacyPolicy.descriptionFr,
    confirmationMessage: !!form.endPage.descriptionEn || !!form.endPage.descriptionFr,
    translate: isFormTranslated(form),
    responseDelivery: !!email,
  };

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

  const isSaveable = useCallback(() => {
    return hasData(["title", "questions"]);
  }, [hasData]);

  return { data, hasData, isPublishable, isSaveable, userCanPublish };
};

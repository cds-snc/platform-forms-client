import { useCallback } from "react";
import {
  Choice,
  Description,
  ElementType,
  FormSchema,
  publishRequiredFields,
  Title,
} from "../types";
import useTemplateStore from "../store/useTemplateStore";

const MissingTranslation = {};

const isTitleTranslated = (element: Title) => {
  if (!element.titleEn || !element.titleFr) {
    throw MissingTranslation;
  }
};

const isDescriptionTranslated = (element: Description) => {
  if (!element.descriptionEn || !element.descriptionFr) {
    throw MissingTranslation;
  }
};

const areChoicesTranslated = (choices: Choice[]) => {
  choices.forEach((choice) => {
    if (!choice.en || !choice.fr) {
      throw MissingTranslation;
    }
  });
};

const isElementTranslated = (element: ElementType) => {
  isTitleTranslated(element.properties);

  // Description is optional
  if (element.properties.descriptionEn || element.properties.descriptionFr) {
    isDescriptionTranslated(element.properties);
  }

  // Check choices if there are any
  if (element.properties.choices) {
    areChoicesTranslated(element.properties.choices);
  }
};

export const checkTranslated = (form: FormSchema) => {
  try {
    isTitleTranslated(form);
    isDescriptionTranslated(form.introduction);
    isDescriptionTranslated(form.privacyPolicy);
    isDescriptionTranslated(form.endPage);

    form.elements.forEach((element) => {
      if (element.type === "richText") {
        isDescriptionTranslated(element.properties);
      }
      if (element.type !== "richText") {
        isElementTranslated(element);
      }
    });
  } catch (e) {
    return false;
  }

  return true;
};

export const useAllowPublish = () => {
  const { form, submission } = useTemplateStore();
  let email = "";
  if (submission?.email) {
    email = submission?.email;
  }

  const data = {
    title: !!form.titleEn || !!form.titleFr,
    questions: !!form.elements.length,
    privacyPolicy: !!form.privacyPolicy.descriptionEn || !!form.privacyPolicy.descriptionFr,
    confirmationMessage: !!form.endPage.descriptionEn || !!form.endPage.descriptionFr,
    translate: checkTranslated(form),
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

  return { data, hasData, isPublishable, isSaveable };
};

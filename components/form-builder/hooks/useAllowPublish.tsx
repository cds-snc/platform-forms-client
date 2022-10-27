import { useCallback } from "react";
import { FormSchema, publishRequiredFields } from "../types";
import useTemplateStore from "../store/useTemplateStore";

const MissingTranslation = {};

const isTranslated = (elementEn: string, elementFr: string) => {
  if (elementEn || elementFr) {
    if (!elementEn || !elementFr) {
      throw MissingTranslation;
    }
  }
  return true;
};

const checkTranslated = (form: FormSchema) => {
  try {
    isTranslated(form.titleEn, form.titleFr);
    isTranslated(form.introduction.descriptionEn, form.introduction.descriptionFr);
    isTranslated(form.privacyPolicy.descriptionEn, form.privacyPolicy.descriptionFr);
    isTranslated(form.endPage.descriptionEn, form.endPage.descriptionFr);
    form.elements.forEach((element) => {
      isTranslated(element.properties.titleEn, element.properties.titleFr);
      isTranslated(element.properties.descriptionEn, element.properties.descriptionFr);
      if (element.properties.choices) {
        element.properties.choices.forEach((choice) => {
          isTranslated(choice.en, choice.fr);
        });
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
    title: !!form.titleEn,
    questions: !!form.elements.length,
    privacyPolicy: !!form.privacyPolicy.descriptionEn,
    confirmationMessage: !!form.endPage.descriptionEn,
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

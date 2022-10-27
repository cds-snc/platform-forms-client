import { useCallback } from "react";
import { FormSchema, publishRequiredFields } from "../types";
import useTemplateStore from "../store/useTemplateStore";

const checkTranslated = (form: FormSchema) => {
  return (
    !!form.elements[0]?.properties.descriptionEn && !!form.elements[0]?.properties.descriptionFr
  );
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

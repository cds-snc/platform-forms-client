import { useCallback } from "react";
import { publishRequiredFields, FormSchema } from "../types";
import useTemplateStore from "../store/useTemplateStore";

export const useAllowPublish = (
  form?: Omit<FormSchema, "layout" | "introduction" | "version"> | null,
  email?: string
) => {
  const { form: defaultForm, submission } = useTemplateStore();

  if (!form) {
    form = defaultForm;
  }

  if (!email && submission?.email) {
    email = submission?.email;
  }

  const data = {
    title: !!form.titleEn,
    questions: !!form.elements.length,
    privacyPolicy: !!form.privacyPolicy.descriptionEn,
    confirmationMessage: !!form.endPage.descriptionEn,
    translate: !!form.elements[0]?.properties.titleEn && !!form.elements[0]?.properties.titleFr,
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

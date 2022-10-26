import { useCallback } from "react";
import useTemplateStore from "../store/useTemplateStore";
import { publishRequiredFields } from "../types";

export const useAllowPlublish = () => {
  const { form } = useTemplateStore();
  const data = {
    title: !!form.titleEn,
    confirmationMessage: form.endPage.descriptionEn ? true : false,
    questions: !!form.elements.length,
    privacyPolicy: !!form.privacyPolicy.descriptionEn,
    translate: false,
    responseDelivery: false,
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
    return true;
  }, []);

  const isSaveable = useCallback(() => {
    return true;
  }, []);

  return { data, hasData, isPublishable, isSaveable };
};

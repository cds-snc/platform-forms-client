import { useCallback } from "react";
import useTemplateStore from "../store/useTemplateStore";

export const useAllowPlublish = () => {
  const { form } = useTemplateStore();
  const data = {
    title: !!form.titleEn,
    questions: !!form.elements.length,
    privacyPolicy: !!form.privacyPolicy.descriptionEn,
    confirmationMessage: !!form.endPage.descriptionEn,
  };

  const hasData = useCallback(
    (fields: [string] | []) => {
      return fields.every(
        (field) => Object.prototype.hasOwnProperty.call(data, field) && data[field] === true
      );
    },
    [data]
  );
  return { data, hasData };
};

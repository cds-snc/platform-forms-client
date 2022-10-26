import { useCallback } from "react";
import useTemplateStore from "../store/useTemplateStore";

export const useAllowPlublish = () => {
  const { form } = useTemplateStore();
  const data = {
    title: form.titleEn ? true : false,
    questions: form.elements.length ? true : false,
    privacyPolicy: form.privacyPolicy.descriptionEn ? true : false,
    confirmationMessage: form.endPage.descriptionEn ? true : false,
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

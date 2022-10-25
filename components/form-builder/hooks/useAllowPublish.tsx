import useTemplateStore from "../store/useTemplateStore";

export const useAllowPlublish = () => {
  const { form } = useTemplateStore();
  const title = form.titleEn;
  const privacyPolicy = form.privacyPolicy.descriptionEn || false;
  const confirmationMessage = form.endPage.descriptionEn || false;
  const questions = form.elements.length || 0;
  return { title, privacyPolicy, confirmationMessage, questions };
};

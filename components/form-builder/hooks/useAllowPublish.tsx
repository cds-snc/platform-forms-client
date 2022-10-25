import useTemplateStore from "../store/useTemplateStore";

export const useAllowPlublish = () => {
  const { form } = useTemplateStore();
  const title = form.titleEn;
  const questions = form.elements.length || false;
  const privacyPolicy = form.privacyPolicy.descriptionEn || false;
  const confirmationMessage = form.endPage.descriptionEn || false;
  return { title, privacyPolicy, confirmationMessage, questions };
};

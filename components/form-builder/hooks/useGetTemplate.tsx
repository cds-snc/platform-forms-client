import useTemplateStore from "../store/useTemplateStore";
import { FormSchema, TemplateSchema } from "../types";

export const useGetTemplate = () => {
  const {
    form: { endPage, elements, titleEn, titleFr, version, emailSubjectEn, emailSubjectFr },
  } = useTemplateStore();

  const form: FormSchema = {
    layout: [],
    endPage,
    titleEn,
    titleFr,
    version,
    elements,
    emailSubjectEn,
    emailSubjectFr,
  };

  form.layout = elements.map((element) => {
    return element.id;
  });

  const schema: TemplateSchema = {
    form,
    submission: { email: "test@test.com" },
    publishingStatus: true,
  };

  const stringified = JSON.stringify(schema, null, 2);

  return { schema, stringified };
};

import { FormElement } from "@lib/types";
import { allowedTemplates, TemplateTypes } from "@lib/utils/form-builder";
import { loadBlockTemplate } from "@formBuilder/actions";

export const blockLoader = async (
  type: TemplateTypes,
  startIndex: number,
  onData: (data: FormElement, position: number) => void
) => {
  if (!allowedTemplates.includes(type)) {
    return;
  }

  const result = await loadBlockTemplate({ type });

  if (result.error || !result.data) {
    throw new Error("Invalid template type");
  }

  result.data.forEach((data: FormElement, index: number) => {
    onData(data, startIndex + index);
  });
};

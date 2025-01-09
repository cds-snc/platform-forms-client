// import { useTranslation } from "@i18n/client";
import { FormElement, FormElementTypes } from "@lib/types";
import { getProperty } from "@lib/i18nHelpers";

export const ErrorListMessage = ({
  id,
  defaultValue,
  elements,
  language,
}: {
  id: string | number | undefined;
  defaultValue: string | number | undefined;
  elements: FormElement[];
  language: string;
}) => {
  // const { t } = useTranslation("form-builder");

  const element = elements.find((element) => String(element.id) === String(id));

  if (!element?.type || !defaultValue || !id) {
    return defaultValue;
  }

  let title: string = "";

  try {
    title = element.properties?.[getProperty("title", language)] as string;
  } catch (error) {
    return defaultValue;
  }

  switch (element?.type) {
    case FormElementTypes.textField:
      return `Error: Text Field Element not found ${title}`;
    case FormElementTypes.textArea:
      return "Error: Text Area Element not found";
    default:
      return "Error: Form Element not found";
  }
};

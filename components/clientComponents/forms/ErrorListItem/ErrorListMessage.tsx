import { FormElement } from "@lib/types";
import { Language } from "@lib/utils";

export const ErrorListMessage = ({
  defaultValue,
}: {
  id: string | number | undefined;
  defaultValue: string | number | undefined;
  elements: FormElement[];
  language: Language;
  subElement?: FormElement;
}) => defaultValue;

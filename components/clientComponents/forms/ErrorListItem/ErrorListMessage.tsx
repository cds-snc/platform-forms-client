import { useTranslation } from "@i18n/client";
import { FormElement } from "@lib/types";
import { truncateString } from "@lib/client/clientHelpers";
import { getLocalizedProperty, Language, LocalizedElementProperties } from "@lib/utils";
import { getRequiredErrorMessage } from "@lib/validation/requiredErrors";

export const ErrorListMessage = ({
  id,
  defaultValue,
  elements,
  language,
  subElement,
}: {
  id: string | number | undefined;
  defaultValue: string | number | undefined;
  elements: FormElement[];
  language: Language;
  subElement?: FormElement;
}) => {
  const { t } = useTranslation("form-builder");
  const resolvedElement =
    subElement || elements.find((element) => String(element.id) === String(id));
  const rowIndex = subElement ? Number(String(id).split(".")[1]) : NaN;
  const entryNumber = Number.isInteger(rowIndex) && rowIndex >= 0 ? rowIndex + 1 : undefined;
  if (
    resolvedElement &&
    defaultValue === getRequiredErrorMessage(resolvedElement, language, t, entryNumber)
  ) {
    return defaultValue;
  }

  if (!resolvedElement?.type || !defaultValue || id === undefined) {
    return defaultValue;
  }
  const question = truncateString(
    resolvedElement.properties[getLocalizedProperty(LocalizedElementProperties.TITLE, language)]
  );

  // For non default validation errors, use a specific error message if one exists
  if (
    defaultValue &&
    typeof defaultValue === "string" &&
    !defaultValue.includes(t("input-validation.required"))
  ) {
    return `${defaultValue}: ${question}`;
  }

  return getRequiredErrorMessage(resolvedElement, language, t, entryNumber);
};

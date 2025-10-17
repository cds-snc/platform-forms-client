import { FormElement } from "@lib/types";
import { Label } from "@clientComponents/forms";
import { getLocalizedProperty } from "@lib/utils";

export const GenericComponentLabel = (
  id: string | number,
  element: FormElement,
  lang: string,
  isRequired: boolean
) => {
  const descriptionPerLocale = element.properties[getLocalizedProperty("description", lang)];
  const description = descriptionPerLocale ? descriptionPerLocale.toString() : "";

  const placeHolderPerLocale = element.properties[getLocalizedProperty("placeholder", lang)];
  const placeHolder = placeHolderPerLocale ? placeHolderPerLocale.toString() : "";

  const labelText = element.properties[getLocalizedProperty("title", lang)]?.toString();

  const labelComponent = labelText ? (
    <Label
      key={`label-${id}`}
      id={`label-${id}`}
      htmlFor={`${id}`}
      className={isRequired ? "required" : ""}
      required={isRequired}
      validation={element.properties.validation}
      group={["radio", "checkbox"].indexOf(element.type) !== -1}
      lang={lang}
    >
      {labelText}
    </Label>
  ) : null;

  return { labelComponent, description, placeHolder };
};

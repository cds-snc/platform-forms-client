// Update the path below to the correct location of ComponentPlugin
import { ComponentPlugin } from "@lib/components/ComponentPlugin";
import { TextInput } from "./TextInput";
import { FormElementTypes } from "@lib/types";
import { getLocalizedProperty } from "@lib/utils";
import { Label, Description } from "@clientComponents/forms";

export const TextInputPlugin: ComponentPlugin = {
  meta: {
    type: FormElementTypes.textField,
  },
  render({ element, lang }) {
    const id = element.id;
    const isRequired = !!element.properties.required;

    const descriptionPerLocale = element.properties[getLocalizedProperty("description", lang)];
    const description = descriptionPerLocale ? descriptionPerLocale.toString() : "";

    const placeHolderPerLocale = element.properties[getLocalizedProperty("placeholder", lang)];
    const placeHolder = placeHolderPerLocale ? placeHolderPerLocale.toString() : "";

    const textType =
      element.properties?.validation?.type &&
      ["email", "name", "number", "password", "search", "tel", "url"].includes(
        element.properties.validation.type
      )
        ? element.properties.validation.type
        : "text";

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

    const spellCheck =
      element.properties?.autoComplete &&
      [
        "email",
        "name",
        "tel",
        "given-name",
        "additional-name",
        "family-name",
        "address-line1",
        "address-level2",
        "address-level1",
        "postal-code",
      ].includes(element.properties?.autoComplete)
        ? false
        : undefined;

    return (
      <div className="focus-group gcds-input-wrapper">
        {labelComponent}
        {description && <Description id={`${id}`}>{description}</Description>}
        <TextInput
          type={textType}
          spellCheck={spellCheck}
          id={`${id}`}
          name={`${id}`}
          required={isRequired}
          ariaDescribedBy={description ? `desc-${id}` : undefined}
          placeholder={placeHolder.toString()}
          autoComplete={element.properties.autoComplete?.toString()}
          maxLength={element.properties.validation?.maxLength}
          allowNegativeNumbers={element.properties.allowNegativeNumbers}
        />
      </div>
    );
  },
};

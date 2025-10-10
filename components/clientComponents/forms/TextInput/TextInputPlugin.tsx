"use client";
// Update the path below to the correct location of ComponentPlugin
import { ComponentPlugin } from "@lib/components/ComponentPlugin";
import { FormElementTypes, InputFieldProps } from "@lib/types";
import { Description } from "@clientComponents/forms";
import { GenericComponentLabel } from "../../globals/GenericComponentLabel";
import { useField } from "formik";
import { TextInput, type BaseTextInputProps } from "./TextInput";

type FormikTextInputProps = BaseTextInputProps & InputFieldProps;

const FormikTextInput = (props: FormikTextInputProps) => {
  const { id, name, type, ...rest } = props;
  const [field, meta] = useField({ name, type });

  return (
    <TextInput
      id={id}
      type={type}
      {...rest}
      {...field}
      error={meta.touched && meta.error ? meta.error : undefined}
    />
  );
};

export const TextInputPlugin: ComponentPlugin = {
  meta: {
    type: FormElementTypes.textField,
  },
  render({ element, lang }) {
    const id = element.subId ?? element.id;
    const isRequired: boolean = element.properties.validation
      ? element.properties.validation.required
      : false;

    const textType =
      element.properties?.validation?.type &&
      ["email", "name", "number", "password", "search", "tel", "url"].includes(
        element.properties.validation.type
      )
        ? element.properties.validation.type
        : "text";

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

    const genericLabel = GenericComponentLabel(id, element, lang, isRequired);

    return (
      <div className="focus-group gcds-input-wrapper">
        {genericLabel.labelComponent}
        {genericLabel.description && (
          <Description id={`${id}`}>{genericLabel.description}</Description>
        )}
        <FormikTextInput
          type={textType}
          spellCheck={spellCheck}
          id={`${id}`}
          name={`${id}`}
          required={isRequired}
          ariaDescribedBy={genericLabel.description ? `desc-${id}` : undefined}
          placeholder={genericLabel.placeHolder.toString()}
          autoComplete={element.properties.autoComplete?.toString()}
          maxLength={element.properties.validation?.maxLength}
          allowNegativeNumbers={element.properties.allowNegativeNumbers}
        />
      </div>
    );
  },
};

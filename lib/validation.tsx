import { FormValues, DynamicFormProps, FormElement, Responses } from "./types";

export const validateOnSubmit = (
  values: FormValues,
  props: DynamicFormProps
) => {
  const errors: Responses = {};

  for (const item in values) {
    const formMetadata = props.formMetadata;
    const elements: Array<FormElement> = formMetadata.elements;
    const currentItem = elements.find((element) => element.id == item);

    if (!currentItem) {
      return errors;
    }

    const currentValidation = currentItem.properties;

    // Check for required fields
    if (currentValidation && currentValidation.required && !values[item]) {
      errors[item] = props.t("input-validation.required");
    }

    // More checks pending
  }

  return errors;
};

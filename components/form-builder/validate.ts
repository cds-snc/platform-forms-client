import { ValidationError, Validator, ValidatorResult } from "jsonschema";
import templatesSchema from "@lib/middleware/schemas/templates.schema.json";
import { FormRecord } from "@lib/types";

export type errorMessage = { property?: string; message: string };

const getErrorMessageTranslationString = (error: ValidationError) => {
  let property = error.path[error.path.length - 1]
    ? error.path[error.path.length - 1].toString()
    : error.argument;
  let message = "formInvalidProperty";

  if (error.name === "required") {
    property = error.argument;
    message = "formMissingProperty";
  }

  return {
    property: property,
    message: message,
  };
};

export const validateTemplate = (data: FormRecord) => {
  const validator = new Validator();
  const validatorResult: ValidatorResult = validator.validate(data, templatesSchema);
  const errors: errorMessage[] = validatorResult.errors.map(getErrorMessageTranslationString);

  return {
    valid: validatorResult.valid,
    errors: errors,
  };
};

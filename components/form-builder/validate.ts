import { ValidationError, Validator, ValidatorResult } from "jsonschema";
import templatesSchema from "@lib/middleware/schemas/templates.schema.json";
import { FormRecord } from "@lib/types";

export type errorMessage = { message: string };

const getCleanedErrorMessage = (error: ValidationError) => {
  let message = t("formInvalidProperty", { prop: error.path[error.path.length - 1] }); //  `Invalid: ${error.path[error.path.length - 1]}`;

  if (error.name === "required") {
    message = t("formMissingProperty", { property: error.argument }); //  `Missing: ${error.argument}`;
  }

  return {
    message: message,
  };
};

export const validateTemplate = (data: FormRecord) => {
  const validator = new Validator();
  const validatorResult: ValidatorResult = validator.validate(data, templatesSchema);

  const errors: errorMessage[] = [];

  console.log(validatorResult.errors);

  validatorResult.errors.forEach((error) => {
    errors.push(getCleanedErrorMessage(error, t));
  });

  console.log(errors);

  return {
    valid: validatorResult.valid,
    errors: errors,
  };
};

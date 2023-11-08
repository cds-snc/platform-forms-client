import {
  PreValidatePropertyFunction,
  ValidationError,
  Validator,
  ValidatorResult,
} from "jsonschema";
import templatesSchema from "@lib/middleware/schemas/templates.schema.json";
import { FormRecord } from "@lib/types";

export type errorMessage = { property?: string; message: string };

/**
 * Cleans up the provided JSON to remove any opening/closing angle brackets
 * without preceding or trailing spaces (ie <something> becomes < something >)
 * @param object
 * @param key
 */
const cleanAngleBrackets: PreValidatePropertyFunction = (object, key) => {
  const value = object[key];

  if (typeof value === "undefined") return;

  if (typeof value === "string") {
    const openRegex = /<(?!\s)/g;
    const closeRegex = /(?<!\s)>/g;
    object[key] = value.replaceAll(openRegex, "< ").replaceAll(closeRegex, " >");
  }

  return;
};

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
  const validatorResult: ValidatorResult = validator.validate(data, templatesSchema, {
    preValidateProperty: cleanAngleBrackets,
  });
  const errors: errorMessage[] = validatorResult.errors.map(getErrorMessageTranslationString);

  return {
    valid: validatorResult.valid,
    errors: errors,
  };
};

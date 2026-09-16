import { ValidationError, Validator, ValidatorResult } from "jsonschema";
import templatesSchema from "@lib/middleware/schemas/templates.schema.json";
import { FormProperties } from "@lib/types";
import { cleanAngleBrackets } from "@lib/client/jsonFormatting";
import { validateUniqueQuestionIds } from "@lib/utils/validateUniqueQuestionIds";
import { validateCustomRegex } from "@lib/regex/validateCustomRegex";

export type errorMessage = { property?: string; message: string };

const getValidationPath = (error: ValidationError) => error.path.map(String).join(".");

const getErrorMessageTranslationString = (error: ValidationError) => {
  const validationPath = getValidationPath(error);
  let property = validationPath || error.argument;
  let message = "formInvalidProperty";

  if (error.name === "required") {
    property = validationPath ? `${validationPath}.${error.argument}` : error.argument;
    message = "formMissingProperty";
  } else if (
    error.name === "not" &&
    typeof error.argument === "object" &&
    error.argument !== null &&
    "required" in error.argument &&
    Array.isArray(error.argument.required) &&
    error.argument.required.length === 1
  ) {
    property = `${validationPath}.${error.argument.required[0]}`;
  }

  return {
    property: property,
    message: message,
  };
};

export const validateTemplate = (data: FormProperties) => {
  const errors: errorMessage[] = [];

  if (!validateUniqueQuestionIds(data.elements)) {
    errors.push({ message: "startErrorDuplicateQuestionId" });
  }

  if (!validateCustomRegex(data.elements)) {
    errors.push({ message: "startErrorInvalidCustomRegex" });
  }

  const validator = new Validator();
  const validatorResult: ValidatorResult = validator.validate(data, templatesSchema, {
    preValidateProperty: cleanAngleBrackets,
  });
  const validationErrors = validatorResult.errors.filter(
    ({ name }) => !["allOf", "anyOf", "oneOf"].includes(name)
  );
  errors.push(...validationErrors.map(getErrorMessageTranslationString));

  return {
    valid: errors.length === 0,
    errors: errors,
  };
};

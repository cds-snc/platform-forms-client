import { ValidationError, Validator, ValidatorResult } from "jsonschema";
import templatesSchema from "@lib/middleware/schemas/templates.schema.json";
import { FormProperties } from "@lib/types";
import { cleanAngleBrackets } from "@lib/client/jsonFormatting";
import { validateUniqueQuestionIds } from "@lib/utils/validateUniqueQuestionIds";
import { validateCustomRegex } from "@lib/regex/validateCustomRegex";

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
  errors.push(...validatorResult.errors.map(getErrorMessageTranslationString));

  return {
    valid: errors.length === 0,
    errors: errors,
  };
};

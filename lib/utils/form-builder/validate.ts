import { ValidationError, Validator, ValidatorResult } from "jsonschema";
import templatesSchema from "@lib/middleware/schemas/templates.schema.json";
import { FormProperties } from "@lib/types";
import { cleanAngleBrackets } from "@lib/client/jsonFormatting";
import { object, string, array, safeParse } from "valibot";

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

// Updated radio JSON schema using valibot to match templates.schema.json
const radioJsonSchema = object({
  id: string(), // or number() if your IDs are numbers
  type: string(), // should be "radio"
  properties: object({
    choices: array(
      object({
        en: string(),
        fr: string(),
      })
    ),
    titleEn: string(),
    titleFr: string(),
    validation: object({
      // required: (v) => typeof v === "boolean" // valibot's boolean() if imported, or use a custom check
    }),
    descriptionEn: string(),
    descriptionFr: string(),
    // Add other properties as needed from the schema
  }),
});

export const validateRadioJson = (data: FormProperties) => {
  const result = safeParse(radioJsonSchema, data);
  if (result.success) {
    return {
      valid: true,
      errors: [],
    };
  } else {
    // Map valibot errors to errorMessage[]
    const errors: errorMessage[] = result.issues.map((issue) => ({
      property: issue.path?.join("."),
      message: issue.message,
    }));
    return {
      valid: false,
      errors,
    };
  }
};

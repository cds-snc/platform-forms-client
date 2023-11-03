import {
  ValidationError,
  Validator,
  ValidatorResult,
  PreValidatePropertyFunction,
} from "jsonschema";
import templatesSchema from "@lib/middleware/schemas/templates.schema.json";
import { FormRecord } from "@lib/types";
import * as htmlparser2 from "htmlparser2";

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

const htmlChecker: PreValidatePropertyFunction = (object, key) => {
  const value = object[key];
  if (typeof value === "string") {
    // we assume all strings can be valid html
    // use htmlparse2 to construct document
    // we want to ensure that the only thing in the document is a text element
    const parsedString = htmlparser2.parseDocument(value);

    console.log("key:", key, parsedString);

    // if there are zero children its an empty string, if there is more than one child there is html
    if (parsedString.children.length === 0) return;
    else if (parsedString.children.length !== 1) throw new Error(`HTML detected in JSON`);

    const element = parsedString.children[0];
    // if the element detected does not have a text type then it is html
    if (element?.type !== "text") throw new Error(`HTML detected in JSON`);
  }
};

export const validateTemplate = (data: FormRecord) => {


  const validator = new Validator();
  const validatorResult: ValidatorResult = validator.validate(data, templatesSchema, {
    preValidateProperty: htmlChecker,
  });

  const errors: errorMessage[] = validatorResult.errors.map(getErrorMessageTranslationString);

  return {
    valid: validatorResult.valid,
    errors: errors,
  };
};

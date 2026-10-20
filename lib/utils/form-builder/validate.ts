import { ValidationError, Validator, ValidatorResult } from "jsonschema";
import templatesSchema from "@lib/middleware/schemas/templates.schema.json";
import { FormProperties } from "@lib/types";
import { cleanAngleBrackets } from "@lib/client/jsonFormatting";
import { validateUniqueQuestionIds } from "@lib/utils/validateUniqueQuestionIds";
import { validateCustomRegex } from "@lib/regex/validateCustomRegex";
import { createsNextActionCycle } from "@lib/groups/utils/validateGroups";

export type errorMessage = { property?: string; message: string };

const deduplicatePropertyErrors = (errors: errorMessage[]) =>
  errors.filter(
    (error, index) =>
      !error.property || errors.findIndex(({ property }) => property === error.property) === index
  );

const getValidationPath = (error: ValidationError, pathPrefix: (string | number)[] = []) => {
  const path = [...pathPrefix, ...error.path].map(String);
  if (
    error.name === "pattern" &&
    error.path.at(-1) === "properties" &&
    typeof error.instance === "string"
  ) {
    path.push(error.instance);
  }
  return path.join(".");
};

const getErrorMessageTranslationString = (
  error: ValidationError,
  pathPrefix: (string | number)[] = []
) => {
  const validationPath = getValidationPath(error, pathPrefix);
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

type OneOfSchema = {
  oneOf?: {
    properties?: { type?: { const?: unknown } };
  }[];
};

const getOneOfErrors = (error: ValidationError): errorMessage[] => {
  const elementType = (error.instance as { type?: unknown } | null)?.type;
  const schema = (error.schema as OneOfSchema).oneOf?.find(
    ({ properties }) => properties?.type?.const === elementType
  );

  if (!schema) {
    return [getErrorMessageTranslationString(error)];
  }

  const branchResult = new Validator().validate(error.instance, {
    ...schema,
    definitions: templatesSchema.definitions,
  });
  const branchErrors = branchResult.errors
    .filter(({ name }) => !["allOf", "anyOf"].includes(name))
    .map((branchError) => getErrorMessageTranslationString(branchError, error.path));

  return branchErrors.length ? branchErrors : [getErrorMessageTranslationString(error)];
};

export const validateTemplate = (data: FormProperties) => {
  const errors: errorMessage[] = [];

  if (!validateUniqueQuestionIds(data.elements)) {
    errors.push({ message: "startErrorDuplicateQuestionId" });
  }

  if (!validateCustomRegex(data.elements)) {
    errors.push({ message: "startErrorInvalidCustomRegex" });
  }

  if (
    data.groups &&
    Object.entries(data.groups).some(([groupId, group]) =>
      createsNextActionCycle(data.groups!, groupId, group.nextAction)
    )
  ) {
    errors.push({ message: "startErrorNavigationCycle" });
  }

  const validator = new Validator();
  const validatorResult: ValidatorResult = validator.validate(data, templatesSchema, {
    preValidateProperty: cleanAngleBrackets,
  });
  const validationErrors = validatorResult.errors.flatMap((error) => {
    if (error.name === "allOf" || error.name === "anyOf") {
      return [];
    }
    return error.name === "oneOf"
      ? getOneOfErrors(error)
      : [getErrorMessageTranslationString(error)];
  });
  errors.push(...deduplicatePropertyErrors(validationErrors));

  return {
    valid: errors.length === 0,
    errors: errors,
  };
};

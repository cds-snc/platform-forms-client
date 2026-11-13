import { type Schema, ValidationError, Validator, ValidatorResult } from "jsonschema";
import { getTemplateSchema } from "@lib/templates/schemas/templates";
import { FormProperties } from "@lib/types";
import { cleanAngleBrackets } from "@lib/client/jsonFormatting";
import { validateUniqueQuestionIds } from "@lib/utils/validateUniqueQuestionIds";
import { validateCustomRegex } from "@lib/regex/validateCustomRegex";
import { createsNextActionCycle } from "@lib/groups/utils/validateGroups";
import { logMessage } from "@lib/logger";
import { getValidationPath } from "./getValidationPath";
import { deduplicateTemplateProblems } from "./deduplicateTemplateProblems";

export type errorMessage = { property?: string; message: string };

export type TemplateValidationProblem = { path: string; name: string; message: string };

const deduplicatePropertyErrors = (errors: errorMessage[]) =>
  errors.filter(
    (error, index) =>
      !error.property || errors.findIndex(({ property }) => property === error.property) === index
  );

const getErrorMessageTranslationString = (
  error: ValidationError,
  pathPrefix: (string | number)[] = []
) => {
  const validationPath = getValidationPath(error, pathPrefix);
  let property = validationPath || error.argument;
  let message = "formInvalidProperty";

  if (error.name === "required") {
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

const getOneOfErrors = (
  error: ValidationError,
  templateSchema: Schema,
  translateError: typeof getErrorMessageTranslationString,
  pathPrefix: (string | number)[] = []
): errorMessage[] => {
  const elementType = (error.instance as { type?: unknown } | null)?.type;
  const oneOfSchema = (error.schema as OneOfSchema).oneOf?.find(
    ({ properties }) => properties?.type?.const === elementType
  );

  if (!oneOfSchema) {
    return [translateError(error, pathPrefix)];
  }

  const branchResult = new Validator().validate(error.instance, {
    ...oneOfSchema,
    definitions: templateSchema.definitions,
  });
  const branchErrors = branchResult.errors
    .filter(({ name }) => !["allOf", "anyOf"].includes(name))
    .flatMap((branchError) =>
      branchError.name === "oneOf"
        ? getOneOfErrors(branchError, templateSchema, translateError, [
            ...pathPrefix,
            ...error.path,
          ])
        : [translateError(branchError, [...pathPrefix, ...error.path])]
    );

  return branchErrors.length ? branchErrors : [translateError(error, pathPrefix)];
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

  const problems: TemplateValidationProblem[] = errors.map(({ message }) => ({
    path: "",
    name: "template",
    message,
  }));
  const translateError = (error: ValidationError, pathPrefix: (string | number)[] = []) => {
    problems.push({
      path: getValidationPath(error, pathPrefix),
      name: error.name,
      message: error.message,
    });
    return getErrorMessageTranslationString(error, pathPrefix);
  };

  let schema: Schema;

  try {
    schema = getTemplateSchema(data.schemaVersion);
  } catch (e) {
    logMessage.error(e);
    errors.push({ property: "schemaVersion", message: "formInvalidProperty" });
    problems.push({ path: "schemaVersion", name: "schema", message: "formInvalidProperty" });
    return {
      valid: false,
      errors: deduplicatePropertyErrors(errors),
      problems: deduplicateTemplateProblems(problems),
    };
  }

  const validator = new Validator();
  const validatorResult: ValidatorResult = validator.validate(data, schema, {
    preValidateProperty: cleanAngleBrackets,
  });
  const validationErrors = validatorResult.errors.flatMap((error) => {
    if (error.name === "allOf" || error.name === "anyOf") {
      return [];
    }
    return error.name === "oneOf"
      ? getOneOfErrors(error, schema, translateError)
      : [translateError(error)];
  });
  errors.push(...deduplicatePropertyErrors(validationErrors));

  return {
    valid: errors.length === 0,
    errors: errors,
    problems: deduplicateTemplateProblems(problems),
  };
};

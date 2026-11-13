import type { ValidationError } from "jsonschema";

export const getValidationPath = (error: ValidationError, pathPrefix: (string | number)[] = []) => {
  const path = [...pathPrefix, ...error.path].map(String);
  if (error.name === "required" && typeof error.argument === "string") {
    path.push(error.argument);
  } else if (
    error.name === "pattern" &&
    error.path.at(-1) === "properties" &&
    typeof error.instance === "string"
  ) {
    path.push(error.instance);
  }
  return path.join(".");
};

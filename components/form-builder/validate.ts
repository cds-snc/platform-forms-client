import { Validator, ValidatorResult } from "jsonschema";
import { TemplateSchema } from "./types";
import templatesSchema from "@lib/middleware/schemas/templates.schema.json";

export const validateTemplate = (data: TemplateSchema) => {
  const validator = new Validator();
  const validatorResult: ValidatorResult = validator.validate(data, templatesSchema);
  return validatorResult.valid;
};

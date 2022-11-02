import { Validator, ValidatorResult } from "jsonschema";
import templatesSchema from "@lib/middleware/schemas/templates.schema.json";
import { FormRecord } from "@lib/types";

export const validateTemplate = (data: FormRecord) => {
  const validator = new Validator();
  const validatorResult: ValidatorResult = validator.validate(data, templatesSchema);
  return validatorResult.valid;
};

import { Schema, Validator, ValidatorResult } from "jsonschema";

export class JsonValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JsonValidationError";
  }
}

export class JsonValidator {
  validate(json: JSON, schema: Schema): ValidatorResult {
    const validator = new Validator();
    const validatorResult = validator.validate(json, schema);
    if (!validatorResult.valid) {
      throw new JsonValidationError(`Invalid JSON. ${validatorResult.errors.toString()}`);
    }
    return validatorResult;
  }
}

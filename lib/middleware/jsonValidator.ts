import { Schema, Validator, ValidatorResult, PreValidatePropertyFunction } from "jsonschema";
import { NextApiRequest, NextApiResponse } from "next";
import { MiddlewareRequest, MiddlewareReturn } from "@lib/types";
import { escapeAngleBrackets } from "@components/form-builder/util";

export type ValidateOptions = {
  jsonKey?: string;
  noHTML?: boolean;
  noValidateMethods?: string[];
};

/**
 * Cleans up the provided JSON to remove any opening/closing angle brackets
 * without preceding or trailing spaces (ie <something> becomes < something >)
 * @param object
 * @param key
 */
export const cleanAngleBrackets: PreValidatePropertyFunction = (object, key) => {
  const value = object[key];

  if (typeof value === "undefined") return;

  if (typeof value === "string") {
    object[key] = escapeAngleBrackets(value);
  }

  return;
};

export const jsonValidator = (schema: Schema, options?: ValidateOptions): MiddlewareRequest => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<MiddlewareReturn> => {
    try {
      if (
        req.method === "GET" ||
        options?.noValidateMethods?.includes(req.method ?? "UNKNOWN_METHOD")
      ) {
        return { next: true };
      }

      // If there is no object to test, fail quickly
      if (req.body?.constructor === Object && Object.keys(req.body).length === 0) {
        res.status(400).json({ error: "JSON Validation Error: Object Required" });
        return { next: false };
      }

      const validator = new Validator();
      const validateObject = options?.jsonKey ? req.body[options.jsonKey] : req.body;

      const validatorResult: ValidatorResult = validator.validate(
        validateObject,
        schema,
        options?.noHTML ? { preValidateProperty: cleanAngleBrackets } : undefined
      );

      if (validatorResult.valid) {
        return { next: true };
      } else {
        throw new Error(validatorResult.errors.toString());
      }
    } catch (e) {
      const validationError = e as Error;
      res.status(400).json({ error: `JSON Validation Error: ${validationError.message}` });
      return { next: false };
    }
  };
};

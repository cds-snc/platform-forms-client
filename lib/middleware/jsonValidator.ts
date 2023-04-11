import { Schema, Validator, ValidatorResult } from "jsonschema";
import { NextApiRequest, NextApiResponse } from "next";
import { MiddlewareRequest, MiddlewareReturn } from "@lib/types";

export type ValidateOptions = {
  jsonKey: string;
};

export const jsonValidator = (schema: Schema, options?: ValidateOptions): MiddlewareRequest => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<MiddlewareReturn> => {
    try {
      if (req.method === "GET") {
        return { next: true };
      }
      const validator = new Validator();
      const validatorResult: ValidatorResult = validator.validate(
        options?.jsonKey ? req.body[options.jsonKey] : req.body,
        schema
      );
      if (validatorResult.valid) {
        return { next: true };
      } else {
        res
          .status(400)
          .json({ error: "JSON Validation Error: " + validatorResult.errors.toString() });
        return { next: false };
      }
    } catch {
      res.status(500).json({ error: "Malformed API Request" });
      return { next: false };
    }
  };
};

import { MiddlewareRequest, MiddlewareReturn } from "@lib/types";
import { Schema, Validator } from "jsonschema";
import { NextApiRequest, NextApiResponse } from "next";

export type ValidateOptions = {
  jsonKey: string;
};

const jsonValidator = (schema: Schema, options: ValidateOptions): MiddlewareRequest => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<MiddlewareReturn> => {
    try {
      if (req.method === "GET") {
        return { pass: true };
      }
      const validator = new Validator();
      const validatorResult = validator.validate(req.body[options.jsonKey], schema);
      if (validatorResult.valid) {
        return { pass: true };
      } else {
        res.status(400).json({ error: validatorResult.errors.toString() });
        return { pass: false };
      }
    } catch {
      res.status(500).json({ error: "Malformed API Request" });
      return { pass: false };
    }
  };
};

export default jsonValidator;

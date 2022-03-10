import { MiddlewareRequest, MiddlewareReturn } from "@lib/types";
import { Schema, Validator } from "jsonschema";
import { NextApiRequest, NextApiResponse } from "next";

export type ValidateOptions = {
  jsonKey: string;
};

export const jsonValidator = (schema: Schema, options: ValidateOptions): MiddlewareRequest => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<MiddlewareReturn> => {
    try {
      if (req.method === "GET") {
        return { next: true };
      }
      const validator = new Validator();
      const validatorResult = validator.validate(req.body[options.jsonKey], schema);
      if (validatorResult.valid) {
        return { next: true };
      } else {
        res.status(400).json({ error: validatorResult.errors.toString() });
        return { next: false };
      }
    } catch {
      res.status(500).json({ error: "Malformed API Request" });
      return { next: false };
    }
  };
};

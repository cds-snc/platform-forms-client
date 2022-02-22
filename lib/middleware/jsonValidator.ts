import { Schema, Validator } from "jsonschema";
import { NextApiRequest, NextApiResponse } from "next";

const blocked = true;
const pass = false;

export type ValidateOptions = {
  jsonKey: string;
};

const validate = (
  schema: Schema,
  options: ValidateOptions
): ((req: NextApiRequest, res: NextApiResponse) => Promise<boolean>) => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<boolean> => {
    try {
      if (req.method === "GET") {
        return pass;
      }
      const validator = new Validator();
      const validatorResult = validator.validate(req.body[options.jsonKey], schema);
      if (validatorResult.valid) {
        return pass;
      } else {
        res.status(400).json({ error: validatorResult.errors.toString() });
        return blocked;
      }
    } catch {
      res.status(500).json({ error: "Malformed API Request" });
      return blocked;
    }
  };
};

export default validate;

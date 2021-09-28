import { Schema, Validator } from "jsonschema";
import { NextApiRequest, NextApiResponse } from "next";

export type validateOptions = {
  jsonKey: string;
}

const validate = (
  schema: Schema,
  handler: (req: NextApiRequest, res: NextApiResponse) => void,
  options: validateOptions
) => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<unknown> => {
    try {
      if (req.method === "GET") {
        return handler(req, res);
      }
      const validator = new Validator();
      const validatorResult = validator.validate(JSON.parse(req.body[options.jsonKey]), schema);
      if (validatorResult.valid) {
        return handler(req, res);
      } else {
        res.status(400).json({ error: validatorResult.errors.toString() });
      }
    } catch {
      res.status(500).json({ error: "Malformed API Request" });
    }
  };
};

export default validate;

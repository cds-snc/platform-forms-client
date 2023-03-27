import {
  Schema,
  Validator,
  ValidatorResult,
  PreValidatePropertyFunction,
  validate,
} from "jsonschema";
import { NextApiRequest, NextApiResponse } from "next";
import { MiddlewareRequest, MiddlewareReturn } from "@lib/types";
import * as htmlparser2 from "htmlparser2";
import { logMessage } from "@lib/logger";

export type ValidateOptions = {
  jsonKey: string;
  noHTML?: boolean;
};

/**
 * This function when passed into the jsonschema validate function
 * will receive all possible key value pairs defined in the schema
 * and will check string values to ensure that there is not HTML
 * @param object
 * @param key
 */
const htmlChecker: PreValidatePropertyFunction = (object, key) => {
  const value = object[key];
  if (typeof value === "string") {
    // we assume all strings can be valid html
    // use htmlparse2 to construct document
    // we want to ensure that the only thing in the document is a text element
    const parsedString = htmlparser2.parseDocument(value);

    // if there are zero children its an empty string, if there is more than one child there is html
    if (parsedString.children.length === 0) return;
    else if (parsedString.children.length !== 1) throw new Error(`HTML detected in JSON`);

    const element = parsedString.children[0];
    // if the element detected does not have a text type then it is html
    if (element?.type !== "text") throw new Error(`HTML detected in JSON`);
  }
};

export const jsonValidator = (schema: Schema, options?: ValidateOptions): MiddlewareRequest => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<MiddlewareReturn> => {
    try {
      if (req.method === "GET") {
        return { next: true };
      }
      const validator = new Validator();
      const validateObject = options?.jsonKey
        ? req.body[options.jsonKey]
        : req.body.toString().length > 0
        ? req.body
        : undefined;
      const validatorResult: ValidatorResult = validator.validate(
        validateObject,
        schema,
        options?.noHTML ? { preValidateProperty: htmlChecker } : undefined
      );
      if (validatorResult.valid) {
        return { next: true };
      } else {
        res
          .status(400)
          .json({ error: "JSON Validation Error: " + validatorResult.errors.toString() });
        return { next: false };
      }
    } catch (e) {
      const validationError = e as Error;
      if (validationError.message === "HTML detected in JSON") {
        res.status(400).json({ error: "JSON Validation Error: HTML detected in JSON" });
      } else {
        res.status(500).json({ error: "Malformed API Request" });
      }
      return { next: false };
    }
  };
};

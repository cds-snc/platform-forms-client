import { NextApiRequest, NextApiResponse } from "next";
import { MiddlewareRequest, MiddlewareReturn } from "@lib/types";
import { FormConfiguration } from "@lib/types/form-types";

export type ValidateOptions = {
  jsonKey: string;
};

export const uniqueIDValidator = (options?: ValidateOptions): MiddlewareRequest => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<MiddlewareReturn> => {
    try {
      if (req.method !== "POST") {
        return { next: true };
      }
      const jsonConfig: FormConfiguration = options?.jsonKey ? req.body[options.jsonKey] : req.body;
      const elementIDs: Array<number> = jsonConfig.form.elements.map((element) => {
        return element.id;
      });
      const duplicateElementIDs = elementIDs.filter(
        (value, index, array) => array.indexOf(value) !== index
      );
      if (duplicateElementIDs.length === 0) {
        return { next: true };
      } else {
        res.status(400).json({
          error: `JSON Validation Error: Duplicate IDs detected: ${duplicateElementIDs.join()}`,
        });
        return { next: false };
      }
    } catch {
      res.status(500).json({ error: "Malformed API Request" });
      return { next: false };
    }
  };
};

export const layoutIDValidator = (options?: ValidateOptions): MiddlewareRequest => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<MiddlewareReturn> => {
    try {
      if (req.method !== "POST") {
        return { next: true };
      }
      const jsonConfig: FormConfiguration = options?.jsonKey ? req.body[options.jsonKey] : req.body;
      const elementIDs: Array<number> = jsonConfig.form.elements.map((element) => {
        return element.id;
      });
      const missingLayoutIDs = jsonConfig.form.layout.filter(
        (layoutID) => elementIDs.indexOf(layoutID) === -1
      );
      if (missingLayoutIDs.length === 0) {
        return { next: true };
      } else {
        res.status(400).json({
          error: `JSON Validation Error: Layout IDs not found: ${missingLayoutIDs.join()}`,
        });
        return { next: false };
      }
    } catch {
      res.status(500).json({ error: "Malformed API Request" });
      return { next: false };
    }
  };
};

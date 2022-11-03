import { NextApiRequest, NextApiResponse } from "next";
import { BetterOmit, MiddlewareRequest, MiddlewareReturn } from "@lib/types";
import { FormElement, FormElementTypes, FormRecord } from "@lib/types/form-types";

export type ValidateOptions = {
  runValidationIf?: (req: NextApiRequest) => boolean;
  jsonKey: string;
};

/**
 * Will check that all IDs within a jsonConfig.elements.ids are unique
 * @param options the jsonKey for the formConfig in the body
 * @returns MiddlewareReturn
 */
export const uniqueIDValidator = (options?: ValidateOptions): MiddlewareRequest => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<MiddlewareReturn> => {
    try {
      if (options?.runValidationIf?.(req) === false) {
        return { next: true };
      }
      const jsonConfig: BetterOmit<FormRecord, "id" | "bearerToken"> = options?.jsonKey
        ? req.body[options.jsonKey]
        : req.body;
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

/**
 * Will check that all IDs within a layout exist in the elements
 * @param options the jsonKey for the formConfig in the body
 * @returns MiddlewareReturn
 */
export const layoutIDValidator = (options?: ValidateOptions): MiddlewareRequest => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<MiddlewareReturn> => {
    try {
      if (options?.runValidationIf?.(req) === false) {
        return { next: true };
      }
      const jsonConfig: BetterOmit<FormRecord, "id" | "bearerToken"> = options?.jsonKey
        ? req.body[options.jsonKey]
        : req.body;
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

/**
 * Will check that all subElement IDs within a dynamic row are unique, and match the dynamic row ID
 * @param options the jsonKey for the formConfig in the body
 * @returns MiddlewareReturn
 */
export const subElementsIDValidator = (options?: ValidateOptions): MiddlewareRequest => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<MiddlewareReturn> => {
    try {
      if (options?.runValidationIf?.(req) === false) {
        return { next: true };
      }
      const jsonConfig: BetterOmit<FormRecord, "id" | "bearerToken"> = options?.jsonKey
        ? req.body[options.jsonKey]
        : req.body;

      const dynamicRowElements: Array<FormElement> = jsonConfig.form.elements.filter((element) => {
        return element.type === FormElementTypes.dynamicRow;
      });

      let duplicateSubElementIDs: Array<number> = [];
      let unmatchedSubElementIDs: Array<number> = [];

      dynamicRowElements.forEach((dynamicRow: FormElement) => {
        if (dynamicRow.properties.subElements) {
          const subElementIDs: Array<number> = dynamicRow.properties.subElements.map(
            (subElement) => {
              return subElement.id;
            }
          );

          duplicateSubElementIDs = duplicateSubElementIDs.concat(
            subElementIDs.filter((value, index, array) => array.indexOf(value) !== index)
          );

          const dynamicRowId = dynamicRow.id;
          unmatchedSubElementIDs = unmatchedSubElementIDs.concat(
            subElementIDs.filter((subElementID) => {
              return subElementID.toString().startsWith(dynamicRowId.toString()) === false;
            })
          );
        }
      });
      if (duplicateSubElementIDs.length > 0) {
        res.status(400).json({
          error: `JSON Validation Error: Duplicate subElement IDs detected: ${duplicateSubElementIDs.join()}`,
        });
        return { next: false };
      }
      if (unmatchedSubElementIDs.length > 0) {
        res.status(400).json({
          error: `JSON Validation Error: Incorrect subElement IDs detected: ${unmatchedSubElementIDs.join()}`,
        });
        return { next: false };
      }
      return { next: true };
    } catch {
      res.status(500).json({ error: "Malformed API Request" });
      return { next: false };
    }
  };
};

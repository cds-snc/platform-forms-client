import { type NextRequest, NextResponse } from "next/server";
import { MiddlewareRequest, MiddlewareReturn } from "@lib/types";
import { FormElement, FormElementTypes, FormProperties } from "@lib/types/form-types";

export type ValidateOptions = {
  runValidationIf?: (req: NextRequest) => Promise<boolean>;
  jsonKey: string;
};

/**
 * Will check that all IDs within a jsonConfig.elements.ids are unique
 * @param options the jsonKey for the formConfig in the body
 * @returns MiddlewareReturn
 */
export const uniqueIDValidator = (options?: ValidateOptions): MiddlewareRequest => {
  return async (req: NextRequest): Promise<MiddlewareReturn> => {
    if ((await options?.runValidationIf?.(req)) === false) {
      return { next: true };
    }
    const requestBody = await req.json();
    const formProperties: FormProperties = options?.jsonKey
      ? requestBody[options.jsonKey]
      : req.body;
    const elementIDs: Array<number> = formProperties.elements.map((element) => {
      return element.id;
    });
    const duplicateElementIDs = elementIDs.filter(
      (value, index, array) => array.indexOf(value) !== index
    );
    if (duplicateElementIDs.length === 0) {
      return { next: true };
    } else {
      return {
        next: false,
        response: NextResponse.json({
          error: `JSON Validation Error: Duplicate IDs detected: ${duplicateElementIDs.join()}`,
          status: 400,
        }),
      };
    }
  };
};

/**
 * Will check that all IDs within a layout exist in the elements
 * @param options the jsonKey for the formConfig in the body
 * @returns MiddlewareReturn
 */
export const layoutIDValidator = (options?: ValidateOptions): MiddlewareRequest => {
  return async (req: NextRequest): Promise<MiddlewareReturn> => {
    if (options?.runValidationIf?.(req) === false) {
      return { next: true };
    }

    const requestBody = await req.json();
    const formProperties: FormProperties = options?.jsonKey
      ? requestBody[options.jsonKey]
      : req.body;
    const elementIDs: Array<number> = formProperties.elements.map((element) => {
      return element.id;
    });
    const missingLayoutIDs = formProperties.layout.filter(
      (layoutID) => elementIDs.indexOf(layoutID) === -1
    );
    if (missingLayoutIDs.length === 0) {
      return { next: true };
    } else {
      return {
        next: false,
        response: NextResponse.json({
          error: `JSON Validation Error: Layout IDs not found: ${missingLayoutIDs.join()}`,
          status: 400,
        }),
      };
    }
  };
};

/**
 * Will check that all subElement IDs within a dynamic row are unique, and match the dynamic row ID
 * @param options the jsonKey for the formConfig in the body
 * @returns MiddlewareReturn
 */
export const subElementsIDValidator = (options?: ValidateOptions): MiddlewareRequest => {
  return async (req: NextRequest): Promise<MiddlewareReturn> => {
    if (options?.runValidationIf?.(req) === false) {
      return { next: true };
    }
    const requestBody = await req.json();
    const formProperties: FormProperties = options?.jsonKey
      ? requestBody[options.jsonKey]
      : req.body;

    const dynamicRowElements: Array<FormElement> = formProperties.elements.filter((element) => {
      return element.type === FormElementTypes.dynamicRow;
    });

    let duplicateSubElementIDs: Array<number> = [];
    let unmatchedSubElementIDs: Array<number> = [];

    dynamicRowElements.forEach((dynamicRow: FormElement) => {
      if (dynamicRow.properties.subElements) {
        const subElementIDs: Array<number> = dynamicRow.properties.subElements.map((subElement) => {
          return subElement.id;
        });

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
      return {
        next: false,
        response: NextResponse.json({
          error: `JSON Validation Error: Duplicate subElement IDs detected: ${duplicateSubElementIDs.join()}`,
          status: 400,
        }),
      };
    }
    if (unmatchedSubElementIDs.length > 0) {
      return {
        next: false,
        response: NextResponse.json({
          error: `JSON Validation Error: Incorrect subElement IDs detected: ${unmatchedSubElementIDs.join()}`,
          status: 400,
        }),
      };
    }
    return { next: true };
  };
};

import { Submission } from "@lib/types/submission-types";
import { Response } from "@lib/types";
import { safeJSONParse } from "@lib/utils";

const IGNORED_KEYS = ["formID", "securityAttribute"];

type TransformedResponse = { [key: string]: any };

const isDynamicRow = (key: string) => key.includes("-");

const isCheckbox = (key: string) => key.startsWith('{"value"');

const transformCheckboxResponse = (response: Response) => {
  return safeJSONParse<{ value: string[] }>(response as string)?.value || [];
};

/**
 * Add structure to Dynamic Row responses
 *
 * @param key
 * @param value
 * @param transformed
 */
function transformDynamicRow(key: string, value: Response, transformed: TransformedResponse) {
  const [parentKey, subKey, subSubKey] = key.split("-");
  transformed[parentKey] = transformed[parentKey] || [];
  transformed[parentKey][subKey] = transformed[parentKey][subKey] || {};

  transformed[parentKey][subKey][subSubKey] = isCheckbox(value as string)
    ? transformCheckboxResponse(value)
    : value;
}

/**
 * Cleans up and formats the Response object for storage
 *
 * @param payload
 * @returns
 */
export function rehydrateFormResponses(payload: Submission): TransformedResponse {
  const { responses } = payload;
  const transformed: TransformedResponse = {};

  for (const [key, value] of Object.entries(responses)) {
    if (IGNORED_KEYS.includes(key)) {
      continue;
    }

    // DynamicRow
    if (isDynamicRow(key)) {
      transformDynamicRow(key, value, transformed);
    } else {
      // Checkboxes need a bit of massaging
      if (isCheckbox(value as string)) {
        transformed[key] = transformCheckboxResponse(value);
      } else {
        transformed[key] = value;
      }
    }
  }

  return transformed;
}

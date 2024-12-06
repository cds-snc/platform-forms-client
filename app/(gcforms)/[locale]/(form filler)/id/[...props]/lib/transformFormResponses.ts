import { Submission } from "@lib/types/submission-types";
import { Response } from "@lib/types";
import { safeJSONParse } from "@lib/utils";

const IGNORED_KEYS = ["formID", "securityAttribute"];

type ResponseValue = string | string[] | DynamicRow[];

interface DynamicRow {
  [key: string]: ResponseValue;
}

interface TransformedResponse {
  [key: string | number]: ResponseValue;
}

/*
Examples of transformed responses:
Text field
{ '1': 'my text here!!' }

Text with radio
{ '1': 'my text', '2': 'b' }

My text with radio + checkbox
{ '1': 'my text', '2': 'a', '3': [ 'a', 'b' ] }

My text with radio + checkbox + dynamic row
{"1":"my text","2":"a","3":["a"],"4":[{"0":"repeated 1","1":["a"]},{"0":"repeated 2","1":["b","c"]}]}
*/

/**
 * Cleans up and formats the Response object for storage
 *
 * @param payload
 * @returns
 */
export function transformFormResponses(payload: Submission): TransformedResponse {
  const { responses } = payload;
  const transformed: TransformedResponse = {};

  for (const [key, value] of Object.entries(responses)) {
    if (IGNORED_KEYS.includes(key)) {
      continue;
    }

    // DynamicRow
    if (_isDynamicRow(key)) {
      _transformDynamicRow(key, value, transformed);
    } else {
      // Checkboxes need a bit of massaging
      if (_isCheckbox(value as string)) {
        transformed[key] = _transformCheckboxResponse(value);
      } else {
        transformed[key] = value as string;
      }
    }
  }

  return transformed;
}

const _isDynamicRow = (key: string) => key.includes("-");

const _isCheckbox = (key: string) => key.startsWith('{"value"');

/**
 * Cleans up a checkbox response
 * @param response
 * @returns
 */
const _transformCheckboxResponse = (response: Response) => {
  return safeJSONParse<{ value: string[] }>(response as string)?.value || [];
};

/**
 * Add structure to Dynamic Row responses
 *
 * @param key
 * @param value
 * @param transformed
 */
function _transformDynamicRow(key: string, value: Response, transformed: TransformedResponse) {
  const [parentKey, subKey, subSubKey] = key.split("-");
  transformed[parentKey] = transformed[parentKey] || [];
  transformed[parentKey][subKey] = transformed[parentKey][subKey] || {};

  transformed[parentKey][subKey][subSubKey] = _isCheckbox(value as string)
    ? _transformCheckboxResponse(value)
    : value;
}

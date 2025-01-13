import { Submission } from "@lib/types/submission-types";
import { Response } from "@lib/types";
import { safeJSONParse } from "@lib/utils";

const IGNORED_KEYS = ["formID", "securityAttribute"];

type DynamicRowResponse = TransformedResponse[];

interface TransformedResponse {
  [key: string]: Response | DynamicRowResponse;
}

/**
 * A dynamicRow response key is in the format "parentKey-subKey-subSubKey"
 *
 * @param key string
 * @returns boolean
 */
const _isDynamicRow = (key: string) => key.includes("-");

/**
 * A checkbox response is in the format '{"value":[]}'
 *
 * @param value string
 * @returns boolean
 */
const _isCheckbox = (value: string) => value.startsWith('{"value"');

/**
 * Cleans up a checkbox response
 * @param response i.e. {"value":["b"]}
 * @returns
 */
const _transformCheckboxResponse = (response: string): string[] => {
  return safeJSONParse<{ value: string[] }>(response)?.value || [];
};

/**
 * Cleans up and formats the Response object for storage
 *
 * @param payload Submission
 * @returns TransformedResponse
 */
export function transformFormResponses(payload: Submission): TransformedResponse {
  const { responses } = payload;
  let transformed: TransformedResponse = {};

  for (const [key, value] of Object.entries(responses)) {
    if (IGNORED_KEYS.includes(key)) {
      continue;
    }

    // DynamicRow
    if (_isDynamicRow(key)) {
      transformed = _handleDynamicRow(key, value as Response, { ...transformed });
    } else {
      // Checkboxes need a bit of massaging
      if (_isCheckbox(value as string)) {
        transformed[key] = _transformCheckboxResponse(value as string);
      } else {
        transformed[key] = value as string;
      }
    }
  }

  return transformed;
}

/**
 * Add structure to Dynamic Row responses
 *
 * @param key string - i.e. 5-0-0 or 5-0-1
 * @param value Response
 * @param response TransformedResponse
 * @returns TransformedResponse
 */
function _handleDynamicRow(key: string, value: Response, response: TransformedResponse) {
  const [parentKey, subKey, subSubKey] = key.split("-");

  // subKey is the index of the dynamic row array so must be an integer
  const subKeyInt = parseInt(subKey, 10);

  // a dynamic row is an array of TransformedResponses
  response[parentKey] = (response[parentKey] as DynamicRowResponse) || [];

  response[parentKey][subKeyInt] = response[parentKey][subKeyInt] || {};

  if (_isCheckbox(value as string)) {
    response[parentKey][subKeyInt][subSubKey] = _transformCheckboxResponse(value as string);
    return response;
  }

  response[parentKey][subKeyInt][subSubKey] = value as string | string[];

  return response;
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
{
  "1":"my text",
  "2":"a",
  "3":["a"],
  "4": [
    {
      "0":"repeated 1",
      "1":["a"]
    },
    {
      "0":"repeated 2",
      "1":["b","c"]
    }
  ]
}
*/

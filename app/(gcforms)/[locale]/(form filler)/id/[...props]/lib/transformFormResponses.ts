import { Submission } from "@lib/types/submission-types";
import { Response } from "@lib/types";
import { safeJSONParse } from "@lib/utils";
import { TaggedResponse } from "@cdssnc/gcforms-types";

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
 * Determine if a response is a TaggedResponse
 *
 * @param value string
 * @returns boolean
 */
const _isTaggedResponse = (value: string): boolean => {
  const parsed = safeJSONParse(value);
  if (parsed) {
    return Object.prototype.hasOwnProperty.call(parsed, "tag");
  }

  return false;
};

/**
 * Cleans up a checkbox response
 *
 * @param response i.e. {"value":["b"]}
 * @returns
 */
const _transformCheckboxResponse = (response: string): string[] => {
  return safeJSONParse<{ value: string[] }>(response)?.value || [];
};

/**
 * Gets the cleaned up response
 *
 * @param value
 * @returns
 */
const _getResponseValue = (value: string): string | string[] | TaggedResponse => {
  if (_isTaggedResponse(value)) {
    const tag = (safeJSONParse(value) as TaggedResponse).tag;
    const answer = (safeJSONParse(value) as TaggedResponse).answer;
    return {
      tag,
      answer: _getResponseValue(String(answer)),
    };
  }

  if (_isCheckbox(value)) {
    return _transformCheckboxResponse(value);
  }

  return value;
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
      transformed[key] = _getResponseValue(value as string);
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

  response[parentKey][subKeyInt][subSubKey] = _getResponseValue(value as string);

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

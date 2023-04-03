import axios from "axios";
import { NextRouter } from "next/router";
import { logger, logMessage } from "@lib/logger";
import type { FormikBag } from "formik";
import {
  FileInputResponse,
  FormElement,
  FormElementTypes,
  PublicFormRecord,
  Response,
  Responses,
} from "@lib/types";
import { Submission } from "@lib/types/submission-types";
import { getCsrfToken } from "next-auth/react";

/**
 * Put any Client related global helper/utils here. The rest of /lib is for anything server related.
 */

function _buildFormDataObject(formRecord: PublicFormRecord, values: Responses) {
  const formData = {} as { [key: string]: string | FileInputResponse };

  const formElementsWithoutRichTextComponents = formRecord.form.elements.filter(
    (element) => ![FormElementTypes.richText].includes(element.type)
  );

  for (const element of formElementsWithoutRichTextComponents) {
    const result = _handleDynamicRowTypeIfNeeded(element, values[element.id]);
    for (const tuple of result) {
      formData[tuple[0]] = tuple[1];
    }
  }

  formData["formID"] = `${formRecord.id}`;
  formData["securityAttribute"] = formRecord.securityAttribute;

  return formData;
}

function _handleDynamicRowTypeIfNeeded(
  element: FormElement,
  value: Response
): [string, string | FileInputResponse][] {
  if (element.type === FormElementTypes.dynamicRow) {
    if (element.properties.subElements === undefined) return [];

    const responses = value as Responses[];
    const subElements = element.properties.subElements;

    /**
     * We are creating a new data structure (to be passed to the submit API) from the multiple responses that could have been entered
     * for the dynamic row component we are currently processing. */
    return (
      responses
        .map((response, responseIndex) => {
          return subElements
            .map((subElement, subElementIndex) => {
              const result = _handleFormDataType(subElement, response[subElementIndex]);
              /**
               * We are wrapping the result in an array so that if the response is undefined we can return an empty array that will then
               * disappear once we call the `flat` function at the end.
               */
              return result
                ? ([[`${element.id}-${responseIndex}-${subElementIndex}`, result[1]]] as [
                    string,
                    string | FileInputResponse
                  ][])
                : [];
            })
            .flat();
        })
        // `flat` function is needed because we use a `map` in a `map`.
        .flat()
    );
  } else {
    const result = _handleFormDataType(element, value);
    return result ? [result] : [];
  }
}

function _handleFormDataType(
  element: FormElement,
  value: Response
): [string, string | FileInputResponse] | undefined {
  switch (element.type) {
    case FormElementTypes.textField:
    case FormElementTypes.textArea:
      // string
      return _handleFormDataText(element.id.toString(), value as string);
    case FormElementTypes.dropdown:
    case FormElementTypes.radio:
      return value instanceof Object
        ? _handleFormDataText(element.id.toString(), "")
        : _handleFormDataText(element.id.toString(), value as string);
    case FormElementTypes.checkbox:
      // array of strings
      return Array.isArray(value)
        ? _handleFormDataArray(element.id.toString(), value as Array<string>)
        : _handleFormDataText(element.id.toString(), "");
    case FormElementTypes.fileInput:
      return _handleFormDataFileInput(element.id.toString(), value as FileInputResponse);
    case FormElementTypes.richText:
      return undefined;
  }
}

function _handleFormDataFileInput(
  key: string,
  value: FileInputResponse
): [string, FileInputResponse | string] {
  return value.file
    ? [key, { file: value.file, name: value.name, size: value.size, type: value.type }]
    : _handleFormDataText(key, "");
}

function _handleFormDataText(key: string, value: string): [string, string] {
  return [key, value];
}

function _handleFormDataArray(key: string, value: Array<string>): [string, string] {
  return [key, JSON.stringify({ value: value })];
}

async function _submitToAPI(
  values: Responses,
  formikBag: FormikBag<
    {
      formRecord: PublicFormRecord;
      language: string;
      router: NextRouter;
    },
    Responses
  >,
  redirect = true
) {
  const { language, router, formRecord } = formikBag.props;
  const { setStatus } = formikBag;

  const formDataObject = _buildFormDataObject(formRecord, values);
  const token = await getCsrfToken();
  if (token) {
    //making a post request to the submit API
    return await axios({
      url: "/api/submit",
      method: "POST",
      headers: {
        "Content-Language": language,
        "X-CSRF-Token": token,
      },
      data: formDataObject,

      // If development mode disable timeout
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
    })
      .then((serverResponse) => {
        if (serverResponse.data.received === true) {
          if (!redirect) {
            return formRecord.id;
          }
          router.push({
            pathname: `/${language}/id/${formRecord.id}/confirmation`,
          });
        } else {
          throw Error("Server submit API returned an error");
        }
      })
      .catch((err) => {
        logMessage.error(err);
        setStatus("Error");
      });
  } else {
    logMessage.error("Undefined CSRF Token");
    setStatus("Error");
  }
}
function _rehydrateFormResponses(payload: Submission) {
  const { form: formRecord, responses } = payload;

  const rehydratedResponses: Responses = {};

  formRecord.form.elements
    .filter((element) => ![FormElementTypes.richText].includes(element.type))
    .forEach((question: FormElement) => {
      switch (question.type) {
        case FormElementTypes.checkbox: {
          rehydratedResponses[question.id] = _rehydrateCheckBoxResponse(responses[question.id]);
          break;
        }
        case FormElementTypes.dynamicRow: {
          const filteredResponses: [string, Response][] = Object.entries(responses)
            .filter(([key]) => {
              const splitKey = key.split("-");
              return splitKey.length > 1 && splitKey[0] === question.id.toString();
            })
            // Here is a trick to catch and unpack checkbox type of reponses
            // We will need some kind of overhaul on how we pass responses from functions to functions
            .map(([key, value]) => {
              if ((value as string).startsWith('{"value"')) {
                return [key, _rehydrateCheckBoxResponse(value)];
              } else {
                return [key, value];
              }
            });

          const dynamicRowResponses = _rehydrateDynamicRowResponses(filteredResponses);
          rehydratedResponses[question.id] = dynamicRowResponses;
          break;
        }
        default:
          rehydratedResponses[question.id] = responses[question.id];
          break;
      }
    });

  return rehydratedResponses;
}

function _rehydrateDynamicRowResponses(responses: [string, Response][]) {
  const rehydratedResponses: Responses[] = [];

  let currentResponse: Responses = {};
  let currentResponseIndex: string | undefined = undefined;

  for (const [key, value] of responses) {
    const splitKey = key.split("-");
    const responseIndex = splitKey[1];
    const responseSubIndex = splitKey[2];

    if (!currentResponseIndex) {
      currentResponseIndex = responseIndex;
      currentResponse[responseSubIndex] = value;
    } else if (currentResponseIndex === responseIndex) {
      currentResponse[responseSubIndex] = value;
    } else {
      currentResponseIndex = responseIndex;
      rehydratedResponses.push(currentResponse);
      currentResponse = {};
      currentResponse[responseSubIndex] = value;
    }
  }

  rehydratedResponses.push(currentResponse);

  return rehydratedResponses;
}

function _rehydrateCheckBoxResponse(response: Response) {
  return response ? JSON.parse(response as string).value : [];
}

/**
 * Scrolls an element with overflow to its bottom.
 *
 * @param containerEl container element that has the overflow-y set on it
 * @returns undefined
 */
export const scrollToBottom = (containerEl: HTMLElement) => {
  if (!containerEl) {
    return;
  }
  const scrollHeight = containerEl.scrollHeight;
  if (containerEl.scrollTo !== undefined) {
    containerEl.scrollTo({
      top: scrollHeight,
      left: 0,
      behavior: "smooth",
    });
  }
};

/**
 * Like a UUID but smaller and not as unique. So best to append this to the element name.
 * e.g. id = `myElementName-${randomId()}`
 *
 * @returns a random number
 */
export const randomId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Format date for: YYYY-MM-DD
 * @param date to format. Expects a Date type
 * @returns date formatted
 */
export const formatDate = (date: Date): string => {
  if (!(date instanceof Date)) {
    return "Unknown";
  }

  const day = String(date.getDate()).length <= 1 ? `0${date.getDate()}` : date.getDate();
  const month =
    String(date.getMonth()).length <= 1 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

/**
 * Get the number of days passed between two dates.
 * @param endDate Date second or end date to use to compare against startDate
 * @param startDate (optional) Date start date for comparison. Defaults to today's date if none passed
 * @returns number of days passed or -1 for an error
 */
export const getDaysPassed = (endDate: Date | number, startDate?: Date | number): number => {
  // Mainly for unit testing - default to today's date if no date is passed (main case)
  let date1 = null;
  if (!startDate) {
    date1 = new Date();
  } else if (startDate instanceof Date) {
    date1 = startDate;
  } else if (typeof startDate === "number" && String(startDate).length === 13) {
    date1 = new Date(startDate);
  } else {
    return -1; // Invalid date param
  }

  // Allowing UTC timestamps also - do a very basic check
  const date2 =
    typeof endDate === "number" && String(endDate).length === 13 ? new Date(endDate) : endDate;

  if (!(date2 instanceof Date)) {
    return -1; // Invalid date param
  }

  const daysDiff = Math.abs(Number(date2) - Number(date1));
  const daysPassed = Math.round(daysDiff / (1000 * 60 * 60 * 24));
  return daysPassed;
};

export const submitToAPI = logger(_submitToAPI);
export const buildFormDataObject = logger(_buildFormDataObject);
export const rehydrateFormResponses = logger(_rehydrateFormResponses);

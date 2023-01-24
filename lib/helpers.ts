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

// Get the form json object by using the form ID
// Returns => json object of form
async function _getFormByID(formID: string): Promise<PublicFormRecord | undefined> {
  try {
    const response = await axios({
      url: `/api/templates/${formID}`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
    });
    const { data }: { data: Array<PublicFormRecord> } = response.data;
    if (data?.length === 1 && data[0].id) {
      return data[0];
    }
  } catch (err) {
    logMessage.error(err as Error);
  }
}

// Email submission data manipulation
export function extractFormData(submission: Submission): Array<string> {
  const formResponses = submission.responses;
  const formOrigin = submission.form;
  const dataCollector: Array<string> = [];
  formOrigin.form.layout.map((qID) => {
    const question = formOrigin.form.elements.find((element: FormElement) => element.id === qID);
    if (question) {
      handleType(question, formResponses[question.id], dataCollector);
    }
  });
  return dataCollector;
}

function handleType(question: FormElement, response: Response, collector: Array<string>) {
  // Add i18n here later on?
  // Do we detect lang submission or output with mixed lang?
  const qTitle = question.properties.titleEn;
  switch (question.type) {
    case FormElementTypes.textField:
    case FormElementTypes.textArea:
    case FormElementTypes.dropdown:
    case FormElementTypes.radio:
      handleTextResponse(qTitle, response as string, collector);
      break;

    case FormElementTypes.checkbox:
      handleArrayResponse(qTitle, response as Array<string>, collector);
      break;
    case FormElementTypes.dynamicRow:
      handleDynamicForm(
        qTitle,
        question.properties.placeholderEn,
        response as Array<Responses>,
        question.properties.subElements as FormElement[],
        collector
      );
      break;
    case FormElementTypes.fileInput:
      handleTextResponse(qTitle, response as string, collector);
      break;
    case FormElementTypes.richText:
      collector.push(`${question.properties.descriptionEn}`);
  }
}

function handleDynamicForm(
  title: string,
  rowLabel = "Item",
  response: Array<Responses>,
  question: Array<FormElement>,
  collector: Array<string>
) {
  const responseCollector = response.map((row, rIndex) => {
    const rowCollector: Array<string> = [];
    question.map((qItem, qIndex) => {
      // Add i18n here eventually?
      const qTitle = qItem.properties.titleEn;
      switch (qItem.type) {
        case FormElementTypes.textField:
        case FormElementTypes.textArea:
        case FormElementTypes.dropdown:
        case FormElementTypes.radio:
        case FormElementTypes.fileInput:
          handleTextResponse(qTitle, row[qIndex] as string, rowCollector);
          break;

        case FormElementTypes.checkbox:
          handleArrayResponse(qTitle, row[qIndex] as Array<string>, rowCollector);
          break;

        default:
          break;
      }
    });
    rowCollector.unshift(`${String.fromCharCode(13)}***${rowLabel} ${rIndex + 1}***`);
    return rowCollector.join(String.fromCharCode(13));
  });
  responseCollector.unshift(`**${title}**`);
  collector.push(responseCollector.join(String.fromCharCode(13)));
}

function handleArrayResponse(title: string, response: Array<string>, collector: Array<string>) {
  if (response.length) {
    if (Array.isArray(response)) {
      const responses = response
        .map((item) => {
          return `-  ${item}`;
        })
        .join(String.fromCharCode(13));
      collector.push(`**${title}**${String.fromCharCode(13)}${responses}`);
      return;
    } else {
      handleTextResponse(title, response, collector);
      return;
    }
  }
  collector.push(`**${title}**${String.fromCharCode(13)}No response`);
}

function handleTextResponse(title: string, response: string, collector: Array<string>) {
  if (response !== undefined && response !== null && response !== "") {
    collector.push(`**${title}**${String.fromCharCode(13)}${response}`);
    return;
  }

  collector.push(`**${title}**${String.fromCharCode(13)}No Response`);
}

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
  formData["securityAttribute"] = formRecord.securityAttribute ?? "Unclassified";

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

export const getFormByID = logger(_getFormByID);
export const submitToAPI = logger(_submitToAPI);
export const buildFormDataObject = logger(_buildFormDataObject);
export const rehydrateFormResponses = logger(_rehydrateFormResponses);

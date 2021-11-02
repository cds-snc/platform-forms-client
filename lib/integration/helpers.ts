import axios from "axios";
import { logger, logMessage } from "../logger";
import { isServer } from "../tsUtils";
import type { FormikBag } from "formik";
import { getProperty } from "../formBuilder";
import { crudTemplates } from "./crud";
import {
  FormElement,
  Responses,
  Response,
  FormValues,
  DynamicFormProps,
  FileInputResponse,
  Submission,
  CrudTemplateResponse,
  PublicFormSchemaProperties,
  SubmissionProperties,
} from "../types";

// Get the submission format by using the form ID
// Returns => json object of the submission details.
async function _getSubmissionByID(formID: string): Promise<SubmissionProperties | null> {
  return crudTemplates({ method: "GET", formID: formID }).then((response) => {
    const { records } = response.data;
    if (records?.length === 1 && records[0].formConfig?.submission) {
      return {
        ...records[0].formConfig?.submission,
      };
    }
    return null;
  });
}

// Get an array of form schemas based on the publishing status
// Returns -> Array of form schemas
async function _getFormByStatus(
  status: boolean
): Promise<(PublicFormSchemaProperties | undefined)[]> {
  if (isServer()) {
    return crudTemplates({ method: "GET" }).then((response) => {
      const { records } = response.data;
      if (records && records?.length > 0) {
        return records
          .map((record) => {
            if (record.formConfig.publishingStatus === status) {
              return {
                formID: record.formID,
                ...record.formConfig.form,
                publishingStatus: record.formConfig.publishingStatus,
                displayAlphaBanner: record.formConfig.displayAlphaBanner ?? true,
              };
            }
          })
          .filter((val) => typeof val !== "undefined" && val !== null);
      }
      return [];
    });
  } else {
    return await axios({
      url: "/api/templates",
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: {
        method: "GET",
      },
      timeout: 5000,
    })
      .then((response) => {
        const {
          data: { records: records },
        } = response.data as CrudTemplateResponse;
        if (records && records?.length > 0) {
          return records
            .map((record) => {
              if (record.formConfig?.publishingStatus === status) {
                return {
                  formID: record.formID,
                  ...record.formConfig?.form,
                  publishingStatus: record.formConfig?.publishingStatus,
                  displayAlphaBanner: record.formConfig.displayAlphaBanner ?? true,
                };
              }
            })
            .filter((val) => typeof val !== "undefined" && val !== null);
        }
        return [];
      })
      .catch((err) => {
        console.error(err);
        throw new Error("Cannot get forms by status");
      });
  }
}

// Get the form json object by using the form ID
// Returns => json object of form

async function _getFormByID(formID: string): Promise<PublicFormSchemaProperties | null> {
  if (isServer()) {
    return crudTemplates({ method: "GET", formID: formID }).then((response) => {
      const { records } = response.data;
      if (records?.length === 1 && records[0].formConfig.form) {
        return {
          formID,
          ...records[0].formConfig.form,
          publishingStatus: records[0].formConfig.publishingStatus,
          displayAlphaBanner: records[0].formConfig.displayAlphaBanner ?? true,
        };
      }
      return null;
    });
  } else {
    return await axios({
      url: "/api/templates",
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: {
        formID: formID,
        method: "GET",
      },
      timeout: 5000,
    })
      .then((response) => {
        const { records } = response.data.data;
        if (records?.length === 1 && records[0].formConfig.form) {
          return {
            formID,
            ...records[0].formConfig?.form,
            publishingStatus: records[0].formConfig.publishingStatus,
            displayAlphaBanner: records[0].formConfig.displayAlphaBanner ?? true,
          };
        }
        return null;
      })
      .catch((err) => {
        console.error(err);
      });
  }
}

// Email submission data manipulation
export function extractFormData(submission: Submission): Array<string> {
  const formResponses = submission.responses;
  const formOrigin = submission.form;
  const dataCollector: Array<string> = [];
  formOrigin.layout.map((qID) => {
    const question = formOrigin.elements.find(
      (element: FormElement) => element.id === parseInt(qID)
    );
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
    case "textField":
    case "textArea":
    case "dropdown":
    case "radio":
      handleTextResponse(qTitle, response as string, collector);
      break;

    case "checkbox":
      handleArrayResponse(qTitle, response as Array<string>, collector);
      break;
    case "dynamicRow":
      handleDynamicForm(
        qTitle,
        response as Array<Responses>,
        question.properties.subElements as FormElement[],
        collector
      );
      break;
    case "fileInput":
      handleTextResponse(qTitle, response as string, collector);
      break;
  }
}

function handleDynamicForm(
  title: string,
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
        case "textField":
        case "textArea":
        case "dropdown":
        case "radio":
        case "fileInput":
          handleTextResponse(qTitle, row[qIndex] as string, rowCollector);
          break;

        case "checkbox":
          handleArrayResponse(qTitle, row[qIndex] as Array<string>, rowCollector);
          break;
      }
    });
    rowCollector.unshift(`Item ${rIndex + 1}`);
    return rowCollector.join(String.fromCharCode(13));
  });
  responseCollector.unshift(title);
  collector.push(responseCollector.join(String.fromCharCode(13)));
}

function handleArrayResponse(title: string, response: Array<string>, collector: Array<string>) {
  if (response.length) {
    if (Array.isArray(response)) {
      const responses = response
        .map((item) => {
          return `- ${item}`;
        })
        .join(String.fromCharCode(13));
      collector.push(`${title}${String.fromCharCode(13)}${responses}`);
      return;
    } else {
      handleTextResponse(title, response, collector);
      return;
    }
  }
  collector.push(`${title}${String.fromCharCode(13)}- No response`);
}

function handleTextResponse(title: string, response: string, collector: Array<string>) {
  if (response !== undefined && response !== null && response !== "") {
    collector.push(`${title}${String.fromCharCode(13)}-${response}`);
    return;
  }

  collector.push(`${title}${String.fromCharCode(13)}- No Response`);
}

function _buildFormDataObject(form: PublicFormSchemaProperties, values: Responses) {
  const formData = new FormData();

  const formElementsWithoutRichTextComponents = form.elements.filter(
    (element) => !["richText"].includes(element.type)
  );

  for (const element of formElementsWithoutRichTextComponents) {
    const result = _handleDynamicRowTypeIfNeeded(element, values[element.id]);
    for (const tuple of result) {
      formData.append(tuple[0], tuple[1]);
    }
  }

  formData.append("formID", form.formID);

  return formData;
}

function _handleDynamicRowTypeIfNeeded(
  element: FormElement,
  value: Response
): [string, string | Blob][] {
  if (element.type === "dynamicRow") {
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
                    string | Blob
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
): [string, string | Blob] | undefined {
  switch (element.type) {
    case "textField":
    case "textArea":
      // string
      return _handleFormDataText(element.id.toString(), value as string);
    case "dropdown":
    case "radio":
      return value instanceof Object
        ? _handleFormDataText(element.id.toString(), "")
        : _handleFormDataText(element.id.toString(), value);
    case "checkbox":
      // array of strings
      return Array.isArray(value)
        ? _handleFormDataArray(element.id.toString(), value as Array<string>)
        : _handleFormDataText(element.id.toString(), "");
    case "fileInput":
      return _handleFormDataFileInput(element.id.toString(), value as FileInputResponse);
    case "richText":
      return undefined;
  }
}

function _handleFormDataFileInput(key: string, value: FileInputResponse): [string, string | Blob] {
  return value.file ? [key, value.file] : _handleFormDataText(key, "");
}

function _handleFormDataText(key: string, value: string): [string, string] {
  return [key, value];
}

function _handleFormDataArray(key: string, value: Array<string>): [string, string] {
  return [key, JSON.stringify({ value: value })];
}

async function _submitToAPI(values: Responses, formikBag: FormikBag<DynamicFormProps, FormValues>) {
  const { language, router, formConfig, notifyPreviewFlag } = formikBag.props;
  const { setStatus } = formikBag;

  const formDataObject = _buildFormDataObject(formConfig, values);

  //making a post request to the submit API
  return await axios({
    url: "/api/submit",
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
      "Content-Language": language,
    },
    data: formDataObject,
    // If development mode disable timeout
    timeout: process.env.NODE_ENV === "production" ? 5000 : 0,
  })
    .then((serverResponse) => {
      if (serverResponse.data.received === true) {
        const referrerUrl =
          formConfig && formConfig.endPage
            ? {
                referrerUrl: formConfig.endPage[getProperty("referrerUrl", language)],
              }
            : null;
        const htmlEmail = notifyPreviewFlag ? serverResponse.data.htmlEmail : null;
        const endPageText =
          formConfig && formConfig.endPage
            ? JSON.stringify(formConfig.endPage[getProperty("description", language)])
            : "";
        router.push(
          {
            pathname: `/${language}/id/${formConfig.formID}/confirmation`,
            query: {
              ...referrerUrl,
              htmlEmail: htmlEmail,
              pageText: endPageText,
            },
          },
          {
            pathname: `/${language}/id/${formConfig.formID}/confirmation`,
          }
        );
      } else {
        throw Error("Server submit API returned an error");
      }
    })
    .catch((err) => {
      logMessage.error(err);
      setStatus("Error");
    });
}
function _rehydrateFormResponses(payload: Submission) {
  const { form, responses } = payload;

  const rehydratedResponses: Responses = {};

  form.elements
    .filter((element) => !["richText"].includes(element.type))
    .forEach((question: FormElement) => {
      switch (question.type) {
        case "checkbox": {
          rehydratedResponses[question.id] = _rehydrateCheckBoxResponse(responses[question.id]);
          break;
        }
        case "dynamicRow": {
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
export const getFormByStatus = logger(_getFormByStatus);
export const getSubmissionByID = logger(_getSubmissionByID);
export const submitToAPI = logger(_submitToAPI);
export const buildFormDataObject = logger(_buildFormDataObject);
export const rehydrateFormResponses = logger(_rehydrateFormResponses);

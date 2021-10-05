import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import axios from "axios";
import type { FormikBag } from "formik";
import { getProperty } from "./formBuilder";
import { logger, logMessage } from "./logger";
import {
  FormElement,
  Responses,
  Response,
  FormValues,
  DynamicFormProps,
  FileInputResponse,
  Submission,
  CrudTemplateInput,
  CrudTemplateResponse,
  CrudOrganisationInput,
  CrudOrganisationResponse,
  SubmissionProperties,
  PublicFormSchemaProperties,
} from "./types";

import { formCache, organisationCache } from "./cache";

const lambdaClient = new LambdaClient({
  region: "ca-central-1",
  retryMode: "standard",
  endpoint: process.env.LOCAL_LAMBDA_ENDPOINT,
});

async function _crudTemplatesWithCache(payload: CrudTemplateInput): Promise<CrudTemplateResponse> {
  if (payload.method === "GET" && payload.formID) {
    const cachedValue = await formCache.formID.check(payload.formID);
    if (cachedValue) {
      return cachedValue;
    }
  }

  return await _crudTemplates(payload).then((response) => {
    switch (payload.method) {
      case "GET":
        if (payload.formID) {
          formCache.formID.set(payload.formID, response);
        }
        break;
      case "DELETE":
      case "UPDATE":
      case "INSERT":
        if (payload.formID) {
          formCache.formID.invalidate(payload.formID);
        }
        break;
      default:
        break;
    }

    return response;
  });
}

async function _crudTemplates(payload: CrudTemplateInput): Promise<CrudTemplateResponse> {
  const getConfig = (payload: CrudTemplateInput) => {
    const { method, formID, formConfig } = payload;

    switch (payload.method) {
      case "GET":
        return {
          method,
          formID,
        };
      case "INSERT":
        return {
          method,
          formConfig,
        };
      case "UPDATE":
        return {
          method,
          formConfig,
          formID,
        };
      case "DELETE":
        return {
          method: "DELETE",
          formID,
        };
      default:
        return {
          method: "UNDEFINED",
        };
    }
  };

  if (process.env.CYPRESS && payload.method !== "GET") {
    logMessage.info("Templates CRUD API in Test Mode");
    const timer = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(undefined);
        }, 1000);
      });
    };

    return timer().then(() => {
      const { method, formConfig } = payload;
      switch (method) {
        case "INSERT":
          return {
            data: {
              records: [
                {
                  formID: "TEST",
                  formConfig: formConfig ?? {
                    publishingStatus: false,
                    submission: {},
                    form: {
                      titleEn: "test",
                      titleFr: "test",
                      layout: [],
                      elements: [],
                    },
                  },
                  organization: false,
                },
              ],
            },
          };
        case "UPDATE":
          return {
            data: {},
          };
        case "DELETE":
          return {
            data: {},
          };
        default:
          return {
            data: {},
          };
      }
    });
  }

  const encoder = new TextEncoder();
  const command = new InvokeCommand({
    FunctionName: process.env.TEMPLATES_API ?? "Templates",
    Payload: encoder.encode(JSON.stringify(getConfig(payload))),
  });

  return await lambdaClient
    .send(command)
    .then((response) => {
      const decoder = new TextDecoder();
      const respPayload = decoder.decode(response.Payload);
      if (response.FunctionError) {
        //throw Error("Templates API could not process json");
        // temporary more graceful failure here
        logMessage.info("Lambda Template Client not successful");
        return null;
      } else {
        logMessage.info("Lambda Template Client successfully triggered");
        return JSON.parse(respPayload);
      }
    })
    .catch((err) => {
      logMessage.error(err);
      throw new Error("Could not process request with Lambda Templates function");
    });
}

// Get the form json object by using the form ID
// Returns => json object of form

async function _getFormByID(formID: string): Promise<PublicFormSchemaProperties | null> {
  if (typeof window === "undefined") {
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

// Get an array of form schemas based on the publishing status
// Returns -> Array of form schemas
async function _getFormByStatus(
  status: boolean
): Promise<(PublicFormSchemaProperties | undefined)[]> {
  if (typeof window === "undefined") {
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
  form.elements = form.elements.filter((element) => !["richText"].includes(element.type));

  for (const element of form.elements) {
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

    const subElements = element.properties.subElements.filter(
      (element) => !["richText"].includes(element.type)
    );

    const responses = value as Responses[];

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
      // file input
      return _handleFormDataFileInput(element.id.toString(), value as FileInputResponse);
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

// CRUD for Organisations
async function _crudOrganisationsWithCache(
  payload: CrudOrganisationInput
): Promise<CrudOrganisationResponse> {
  if (payload.method === "GET" && payload.organisationID) {
    const cachedValue = await organisationCache.organisationID.check(payload.organisationID);
    if (cachedValue) {
      return cachedValue;
    }
  }

  return await _crudOrganisations(payload).then((response) => {
    switch (payload.method) {
      case "GET":
        if (payload.organisationID) {
          organisationCache.organisationID.set(payload.organisationID, response);
        }
        break;
      case "DELETE":
      case "UPDATE":
      case "INSERT":
        if (payload.organisationID) {
          organisationCache.organisationID.invalidate(payload.organisationID);
        }
        break;
      default:
        break;
    }

    return response;
  });
}

async function _crudOrganisations(
  payload: CrudOrganisationInput
): Promise<CrudOrganisationResponse> {
  const getConfig = (payload: CrudOrganisationInput) => {
    const { method, organisationID, organisationNameEn, organisationNameFr } = payload;

    switch (payload.method) {
      case "GET":
        return {
          method,
          organisationID,
        };
      case "INSERT":
        return {
          method,
          organisationNameEn,
          organisationNameFr,
        };
      case "UPDATE":
        return {
          method,
          organisationID,
          organisationNameEn,
          organisationNameFr,
        };
      case "DELETE":
        return {
          method: "DELETE",
          organisationID,
        };
      default:
        return {
          method: "UNDEFINED",
        };
    }
  };

  if (process.env.CYPRESS && payload.method !== "GET") {
    logMessage.info("Organisations CRUD API in Test Mode");
    const timer = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(undefined);
        }, 1000);
      });
    };

    return timer().then(() => {
      const { method } = payload;
      switch (method) {
        case "INSERT":
          return {
            data: {
              records: [
                {
                  organisationID: "11111111-1111-1111-1111-111111111111",
                  organisationNameEn: "Test",
                  organisationNAmeFr: "Test",
                },
              ],
            },
          };
        case "UPDATE":
          return {
            data: {},
          };
        case "DELETE":
          return {
            data: {},
          };
        default:
          return {
            data: {},
          };
      }
    });
  }

  const lambdaClient = new LambdaClient({
    region: "ca-central-1",
    endpoint: process.env.LOCAL_LAMBDA_ENDPOINT,
  });
  const encoder = new TextEncoder();
  const command = new InvokeCommand({
    FunctionName: process.env.ORGANISATIONS_API ?? "Organisations",
    Payload: encoder.encode(JSON.stringify(getConfig(payload))),
  });

  return await lambdaClient
    .send(command)
    .then((response) => {
      const decoder = new TextDecoder();
      const respPayload = decoder.decode(response.Payload);
      if (response.FunctionError) {
        logMessage.info("Lambda Organisations Client not successful");
        return null;
      } else {
        logMessage.info("Lambda Organisations Client successfully triggered");
        return JSON.parse(respPayload);
      }
    })
    .catch((err) => {
      logMessage.error(err);
      throw new Error("Could not process request with Lambda Organisations function");
    });
}

export const getFormByID = logger(_getFormByID);
export const getSubmissionByID = logger(_getSubmissionByID);
export const getFormByStatus = logger(_getFormByStatus);
export const submitToAPI = logger(_submitToAPI);
export const rehydrateFormResponses = logger(_rehydrateFormResponses);
export const buildFormDataObject = logger(_buildFormDataObject);
export const crudOrganisations = logger(_crudOrganisationsWithCache);
export const crudTemplates = logger(_crudTemplatesWithCache);

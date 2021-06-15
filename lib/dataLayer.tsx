import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import axios from "axios";
import type { FormikBag } from "formik";
import { getProperty } from "./formBuilder";
import { logger, logMessage } from "./logger";
import { useFlag } from "./hooks/flags";
import {
  FormElement,
  Responses,
  Response,
  FormValues,
  DynamicFormProps,
  FileInputResponse,
  Submission,
  FormDefinitionProperties,
  SubmissionProperties,
  PublicFormSchemaProperties,
} from "./types";

// CRUD Operations for Templates
interface CrudTemplateInput {
  method: string;
  formID?: string;
  formConfig?: FormDefinitionProperties;
}

interface CrudTemplateResponse {
  data: {
    records?: {
      formID: string;
      formConfig: FormDefinitionProperties;
      organization?: boolean;
    }[];
  };
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
        break;
      case "DELETE":
        return {
          method: "DELETE",
          formID,
        };
        break;
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
          break;
        case "DELETE":
          return {
            data: {},
          };
          break;
        default:
          return {
            data: {},
          };
      }
    });
  }

  const lambdaClient = new LambdaClient({ region: "ca-central-1" });
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
          };
        }
        return null;
      })
      .catch((err) => {
        console.error(err);
      });
  }
}

// Get an array of form IDs based on the publishing status
// Returns -> Array of form IDs.
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
  form.elements.forEach((question: FormElement) => {
    const response = responses[question.id];
    switch (question.type) {
      case "checkbox":
      case "dynamicRow":
        if (response) {
          rehydratedResponses[question.id] = JSON.parse(response as string).value;
        } else rehydratedResponses[question.id] = [];
        break;
      case "richText":
        break;
      default:
        rehydratedResponses[question.id] = response;
    }
  });
  return rehydratedResponses;
}

// Email submission data manipulation

export function extractFormData(submission: Submission): Array<string> {
  const formResponses = submission.responses;
  const formOrigin = submission.form;
  const dataCollector: Array<string> = [];
  formOrigin.layout.map((qID) => {
    const question = formOrigin.elements.find((element: FormElement) => element.id === qID);
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

  form.elements.map((element) => {
    _handleFormDataType(element, values[element.id], formData);
  });
  formData.append("formID", form.formID);
  return formData;
}

function _handleFormDataType(element: FormElement, value: Response, formData: FormData) {
  switch (element.type) {
    case "textField":
    case "textArea":
      // string
      _handleFormDataText(element.id, value as string, formData);
      break;

    case "dropdown":
    case "radio":
      value instanceof Object
        ? _handleFormDataText(element.id, "", formData)
        : _handleFormDataText(element.id, value, formData);
      break;

    case "checkbox":
    case "dynamicRow":
      // array of strings
      Array.isArray(value)
        ? _handleFormDataArray(element.id, value as Array<string>, formData)
        : _handleFormDataText(element.id, "", formData);

      break;
    case "fileInput":
      // file input
      _handleFormDataFileInput(element.id, value as FileInputResponse, formData);
      break;
  }
}

function _handleFormDataFileInput(key: string, value: FileInputResponse, formData: FormData) {
  value.file ? formData.append(key, value.file) : _handleFormDataText(key, "", formData);
}

function _handleFormDataText(key: string, value: string, formData: FormData) {
  formData.append(key, value);
}

function _handleFormDataArray(key: string, value: Array<string>, formData: FormData) {
  formData.append(key, JSON.stringify({ value: value }));
}
async function _submitToAPI(values: Responses, formikBag: FormikBag<DynamicFormProps, FormValues>) {
  const { language, router, formConfig } = formikBag.props;
  const { setStatus } = formikBag;
  const notifyPreview = await useFlag("notifyPreview");

  const formDataObject = _buildFormDataObject(formConfig, values);

  //making a post request to the submit API
  await axios({
    url: "/api/submit",
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data: formDataObject,
    timeout: process.env.NODE_ENV ? 0 : 5000,
  })
    .then((serverResponse) => {
      if (serverResponse.data.received === true) {
        const referrerUrl =
          formConfig && formConfig.endPage
            ? {
                referrerUrl: formConfig.endPage[getProperty("referrerUrl", language)],
              }
            : null;
        const htmlEmail = notifyPreview ? serverResponse.data.htmlEmail : null;
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

export const getFormByID = logger(_getFormByID);
export const getSubmissionByID = logger(_getSubmissionByID);
export const getFormByStatus = logger(_getFormByStatus);
export const submitToAPI = logger(_submitToAPI);
export const rehydrateFormResponses = logger(_rehydrateFormResponses);
export const buildFormDataObject = logger(_buildFormDataObject);
export const crudTemplates = logger(_crudTemplates);

import Forms from "../forms/forms";
import axios from "axios";
import type { FormikBag } from "formik";
import { getProperty } from "./formBuilder";
import { logger, logMessage } from "./logger";
import {
  FormElement,
  FormMetadataProperties,
  Responses,
  Response,
  FormValues,
  DynamicFormProps,
} from "./types";

// Get the form json object by using the form ID
// Returns => json object of form
function _getFormByID(formID: string): Record<string, unknown> {
  // Need to get these forms from a DB or API in the future
  let formToReturn = null;
  for (const form of Object.values(Forms)) {
    if (form.form.id == formID) {
      formToReturn = {
        ...form.form,
        publishingStatus: form.publishingStatus,
      };
      break;
    }
  }
  return formToReturn;
}

// Get an array of form IDs based on the publishing status
// Returns -> Array of form IDs.
function _getFormByStatus(status: boolean): Array<number> {
  return Object.values(Forms)
    .map(
      logger((form) => {
        if (form.publishingStatus === status) {
          return form.form.id;
        }
      })
    )
    .filter((val) => typeof val !== "undefined" && val !== null);
}

// Get the submission format by using the form ID
// Returns => json object of the submission details.
function _getSubmissionByID(formID: string): Record<string, unknown> {
  let submissionFormat = null;
  for (const submission of Object.values(Forms)) {
    if (submission.form.id == formID) {
      submissionFormat = submission.submission;
      break;
    }
  }
  return submissionFormat;
}

// Email submission data manipulation
interface Submission {
  form: FormMetadataProperties;
  responses: Responses;
}
export function extractFormData(submission: Submission): Array<string> {
  const formResponses = submission.responses;
  const formOrigin = submission.form;
  const dataCollector: Array<string> = [];
  formOrigin.layout.map((qID) => {
    const question = formOrigin.elements.find((element: FormElement) => element.id === qID);
    if (question) {
      handleType(question, formResponses[question.id], dataCollector);
    } else {
      logMessage.error(`Failed component ID look up ${qID} on form ID ${formOrigin.id}`);
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

async function _submitToApI(
  values: FormValues,
  formikBag: FormikBag<DynamicFormProps, FormValues>,
  isProduction: boolean
) {
  const { formMetadata, language, router } = formikBag.props;
  const { setStatus } = formikBag;

  const formResponseObject = {
    form: {
      id: formMetadata.id,
      titleEn: formMetadata.titleEn,
      titleFr: formMetadata.titleFr,
      elements: formMetadata.elements,
      layout: formMetadata.layout,
    },
    responses: values,
  };

  //making a post request to the submit API
  await axios({
    url: "/api/submit",
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
    },
    data: formResponseObject,
    timeout: isProduction ? 3000 : 0,
  })
    .then((serverResponse) => {
      if (serverResponse.data.received === true) {
        const referrerUrl =
          formMetadata && formMetadata.endPage
            ? {
                referrerUrl: formMetadata.endPage[getProperty("referrerUrl", language)],
              }
            : null;
        const htmlEmail = !isProduction ? serverResponse.data.htmlEmail : null;
        const endPageText =
          formMetadata && formMetadata.endPage
            ? JSON.stringify(formMetadata.endPage[getProperty("description", language)])
            : "";
        router.push(
          {
            pathname: `/id/${formMetadata.id}/confirmation`,
            query: { ...referrerUrl, htmlEmail: htmlEmail, pageText: endPageText },
          },
          {
            pathname: `/id/${formMetadata.id}/confirmation`,
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
export const submitToAPI = logger(_submitToApI);

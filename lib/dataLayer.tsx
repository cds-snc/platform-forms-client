import Forms from "../forms/forms";
import logger from "./logger";

// Get the form json object by using the form ID
// Returns => json object of form
function _getFormByID(formID: string): Record<string, unknown> {
  // Need to get these forms from a DB or API in the future
  let formToReturn = null;
  for (const form of Object.values(Forms)) {
    if (form.form.id == formID) {
      formToReturn = form.form;
      break;
    }
  }
  return formToReturn;
}

// Get an array of form IDs based on the publishing status
// Returns -> Array of form IDs.
function _getFormByStatus(status: boolean): Array<number> {
  return Object.values(Forms)
    .map((form) => {
      if (form.publishingStatus === status) {
        return form.form.id;
      }
    })
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

export const getFormByID = logger(_getFormByID);
export const getSubmissionByID = logger(_getSubmissionByID);
export const getFormByStatus = logger(_getFormByStatus);

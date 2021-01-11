import Forms from "../forms/forms";

// Get the form json object by using the form ID
// Returns => json object of form
function getFormByID(formID: string): Record<string, unknown> {
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

// Get the submission format by using the form ID
// Returns => json object of the submission details.
function getSubmissionByID(formID: string): Record<string, unknown> {
  let submissionFormat = null;
  for (const submission of Object.values(Forms)) {
    if (submission.form.id == formID) {
      submissionFormat = submission.submission;
      break;
    }
  }
  return submissionFormat;
}

module.exports = {
  getFormByID,
  getSubmissionByID,
};

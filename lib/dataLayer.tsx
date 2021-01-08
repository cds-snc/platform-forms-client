import Forms from "../forms/forms";

// Get the form json object by using the form ID
// Returns => json object of form
function getFormByID(formID : number) : object {
  // Need to get these forms from a DB or API in the future
  var formToReturn = null;
  for (let form of Object.values(Forms)) {
    if (form.form.id == formID) {
      formToReturn = form.form;
      break;
    }
  }
  return formToReturn;
}

// Get the submission format by using the form ID
// Returns => json object of the submission details.
function getSubmissionByID(formID: number) : object {
  var submissionFormat = null;
  for (let submission of Object.values(Forms)) {
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

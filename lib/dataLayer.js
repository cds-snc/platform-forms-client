import Forms from "../forms/forms";

function getFormByID(formID) {
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

function getSubmissionByID(formID) {
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

import { logMessage } from "@lib/logger";

/**
 * Given a form submission JSON string, returns an array of file attachments objects that
 * includes the file name, S3 object URL and antivirus scan results.
 * @param submissionID - The form submission ID
 * @param formSubmission - The form submission to get the file attachments from
 * @returns {{ fileName: string }[]} - Array of file attachment objects
 */
export function getFileAttachments(
  submissionID: string,
  formSubmission: string
): { fileName: string }[] {
  let attachments: { fileName: string }[] = [];
  const attachmentPrefix = "form_attachments/";
  const attachmentRegex =
    /^form_attachments\/\d{4}-\d{2}-\d{2}\/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}\/.+$/;

  // Check file attachments exist by checking the form submission for the
  // file attachment prefix that's part of the uploaded file's S3 object key
  if (formSubmission.indexOf(attachmentPrefix) > -1) {
    logMessage.info(`${submissionID}: Parsing file attachments from form submission`);

    // Be more explicit in the attachment check to avoid false positives
    const jsonObj = JSON.parse(formSubmission);
    attachments = Object.values<string>(jsonObj)
      .filter((value) => attachmentRegex.test(value))
      .map((value) => ({ fileName: getFileNameFromPath(value) }));
  }

  return attachments;
}

/**
 * Given a file path returns the file name.
 * @param filePath - The file path to get the file name from
 * @returns {string} - The file name
 */
export function getFileNameFromPath(filePath: string): string {
  return filePath.substring(filePath.lastIndexOf("/") + 1);
}

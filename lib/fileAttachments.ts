import { inspect } from "node:util";
import { logMessage } from "@lib/logger";
import { S3Client, GetObjectTaggingCommand, Tag } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  endpoint: process.env.LOCAL_AWS_ENDPOINT ?? undefined,
  forcePathStyle: process.env.LOCAL_AWS_ENDPOINT ? true : undefined,
  region: process.env.AWS_REGION ?? "ca-central-1",
});

/**
 * Given a form submission JSON string, returns an array of file attachments objects that
 * includes the file name, S3 object URL and antivirus scan results.
 * @param submissionID - The form submission ID
 * @param formSubmission - The form submission to get the file attachments from
 * @returns {{ fileName: string, path?: string }[]} - Array of file attachment objects
 */
export function getFileAttachments(
  submissionID: string,
  formSubmission?: string,
  includePath = false
): { fileName: string; path?: string }[] {
  let attachments: { fileName: string; path?: string }[] = [];
  const attachmentPrefix = "form_attachments/";
  const attachmentRegex =
    /^form_attachments\/\d{4}-\d{2}-\d{2}\/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}\/.+$/;

  // Check file attachments exist by checking the form submission for the
  // file attachment prefix that's part of the uploaded file's S3 object key
  if (formSubmission && formSubmission.indexOf(attachmentPrefix) > -1) {
    logMessage.info(`${submissionID}: Parsing file attachments from form submission`);

    // Be more explicit in the attachment check to avoid false positives
    const jsonObj = JSON.parse(formSubmission);
    attachments = Object.values<string>(jsonObj)
      .filter((value) => attachmentRegex.test(value))
      .map((value) => ({
        fileName: getFileNameFromPath(value),
        ...(includePath && { path: value }),
      }));
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

/**
 * Gets the antivirus scan verdict for a given S3 object.  The scan status is stored as
 * S3 object tags with a prefix of `av-`.
 * @param bucket - S3 bucket of the object.
 * @param key - S3 key of the object.
 * @param submissionId - Submission ID the file attachments belong to.
 * @returns { Promise<{ [tag: string]: string } | undefined> } - The tags for the object or undefined if no tags are found.
 */
export async function getFileScanVerdict(
  bucket: string,
  key: string,
  submissionId: string
): Promise<{ [tag: string]: string } | undefined> {
  let tags = undefined;

  try {
    const command = new GetObjectTaggingCommand({
      Bucket: bucket,
      Key: key,
    });
    const data = await s3Client.send(command);
    if (data.TagSet !== undefined) {
      // Only include tags with the `av-` prefix and reduce to a single object
      tags = data.TagSet.filter((Tag: Tag) => Tag.Key && Tag.Key.startsWith("av-"))
        .map((Tag: Tag) => ({ [toCamelCase(Tag.Key as string)]: Tag.Value as string }))
        .reduce((previous, current) => ({ ...previous, ...current }), {});
    }
  } catch (error) {
    logMessage.error(
      `${submissionId}: failed to get object tags for s3://${bucket}/${key}: ${inspect(error)}`
    );
  }

  return tags;
}

/**
 * Given a hyphen separated string such as `bears-are-not-real`, returns the camel case
 * equivalent of `bearsAreNotReal`.
 * @param value - The value to convert to camel case.
 * @returns {string} - The camel case version of the value.
 */
export function toCamelCase(value: string): string {
  return value.replace(/-([a-z])/gi, (match) => match[1].toUpperCase());
}

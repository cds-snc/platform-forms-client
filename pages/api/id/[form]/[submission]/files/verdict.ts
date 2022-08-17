import { inspect } from "node:util";
import { NextApiRequest, NextApiResponse } from "next";
import { logMessage } from "@lib/logger";
import {
  middleware,
  cors,
  validFormSubmission,
  validQueryParams,
  validTemporaryToken,
} from "@lib/middleware";
import { getFileAttachments, getFileScanVerdict } from "@lib/fileAttachments";
import { MiddlewareProps } from "@lib/types";

const FILE_ATTACHMENT_BUCKET = process.env.VAULT_FILE_STORAGE as string;

/**
 * Handles request to retrieve a form submission's file attachment scan verdicts.
 * If a form submission has no file attachments, an empty array is returned.
 * @param req - The HTTP request object
 * @param res - The HTTP response object
 */
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  { formSubmission }: MiddlewareProps
) => {
  const formId = req.query.form as string;
  const submissionId = req.query.submission as string;

  // Get the form submission files
  logMessage.info(`${submissionId}: received file verdict request for formID ${formId}`);
  const files = getFileAttachments(submissionId, formSubmission, true);

  // Get the file scan verdicts
  logMessage.info(`${submissionId}: found ${files.length} files, retrieving scan verdicts`);
  const filesWithVerdicts = await Promise.all(
    files.map(async (file) => {
      const tags = await getFileScanVerdict(
        FILE_ATTACHMENT_BUCKET,
        file.path as string,
        submissionId
      );
      return { ...{ fileName: file.fileName }, ...tags }; // merge the file name and scan tags
    })
  );

  logMessage.info(`${submissionId}: got file scan verdicts ${inspect(filesWithVerdicts)}`);
  return res.status(200).json({ submissionID: submissionId, fileAttachments: filesWithVerdicts });
};

/**
 * Checks if a given query parameter is a non-empty string.
 * @param queryParam - The query parameter value to validate.
 * @returns {boolean} - True if the query parameter is a non-empty string, false otherwise.
 */
export function isValidQueryParam(queryParam: string | string[]): boolean {
  return typeof queryParam === "string" && queryParam.length > 0;
}

export default middleware(
  [
    cors({ allowedMethods: ["GET"] }),
    validTemporaryToken(),
    validQueryParams([
      { name: "form", isValid: isValidQueryParam },
      { name: "submission", isValid: isValidQueryParam },
    ]),
    validFormSubmission("form", "submission"),
  ],
  handler
);

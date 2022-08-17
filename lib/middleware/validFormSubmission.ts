import { inspect } from "node:util";
import { logMessage } from "@lib/logger";
import { NextApiRequest, NextApiResponse } from "next";
import { MiddlewareRequest, MiddlewareReturn } from "@lib/types";
import { getFormSubmission } from "@lib/formSubmission";

/**
 * @description
 * This middleware checks that a form submission exists for the provided form ID and submission ID.
 * It does not perform validation to confirm the requesting user has permission to access the
 * form submission, which should be performed by the `validTemporaryToken` middleware.
 * @returns
 */
export const validFormSubmission = (
  formIdParam: string,
  submissionIdParam: string
): MiddlewareRequest => {
  return async function (req: NextApiRequest, res: NextApiResponse): Promise<MiddlewareReturn> {
    // These should be validated before use, perhaps with the handy validQueryParams middleware ;)
    const formId = req.query[formIdParam] as string;
    const submissionId = req.query[submissionIdParam] as string;

    try {
      const formSubmission = await getFormSubmission(formId, submissionId);
      if (formSubmission === undefined) {
        throw new Error(`Could not find a matching form submission`);
      }
      return { next: true, props: { formSubmission: formSubmission } };
    } catch (error) {
      logMessage.error(
        `Unable to check form submission is valid for formId '${formId}' and submissionId '${submissionId}': ${inspect(
          error
        )}`
      );
      res.status(400).json({
        error:
          "Unable to check form submission is valid. Please check your form ID and submission ID.",
      });
      return { next: false };
    }
  };
};

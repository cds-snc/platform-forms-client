import { NextResponse } from "next/server";
import { logMessage } from "@lib/logger";
import { middleware, jsonValidator, sessionExists } from "@lib/middleware";
import { createTicket } from "@lib/integration/freshdesk";
import downloadReportProblemSchema from "@lib/middleware/schemas/download-report-problem-schema.json";
import { BatchGetCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { MiddlewareProps, VaultStatus, WithRequired } from "@lib/types";
import { dynamoDBDocumentClient } from "@lib/integration/awsServicesConnector";
import { createAbility, AccessControlError } from "@lib/privileges";
import { checkUserHasTemplateOwnership } from "@lib/templates";
import { logEvent } from "@lib/auditLogs";

const MAXIMUM_SUBMISSION_NAMES_PER_REQUEST = 20;

async function getSubmissionsFromSubmissionNames(
  formId: string,
  submissionNames: string[]
): Promise<{
  submissionsToReport: { name: string; confirmationCode: string }[];
  submissionNamesAlreadyUsed: string[];
  submissionNamesNotFound: string[];
}> {
  const accumulatedSubmissions: {
    [name: string]: { status: VaultStatus; confirmationCode: string };
  } = {};

  let requestedKeys = submissionNames.map((name) => {
    return { FormID: formId, NAME_OR_CONF: `NAME#${name}` };
  });

  while (requestedKeys.length > 0) {
    const request = new BatchGetCommand({
      RequestItems: {
        Vault: {
          Keys: requestedKeys,
          ProjectionExpression: "#name,#status,ConfirmationCode",
          ExpressionAttributeNames: {
            "#name": "Name",
            "#status": "Status",
          },
        },
      },
    });

    // eslint-disable-next-line no-await-in-loop
    const response = await dynamoDBDocumentClient.send(request);

    if (response.Responses?.Vault) {
      response.Responses.Vault.forEach((record) => {
        accumulatedSubmissions[record["Name"]] = {
          status: record["Status"],
          confirmationCode: record["ConfirmationCode"],
        };
      });
    }

    if (response.UnprocessedKeys?.Vault?.Keys) {
      requestedKeys = response.UnprocessedKeys.Vault.Keys as {
        FormID: string;
        NAME_OR_CONF: string;
      }[];
    } else {
      requestedKeys = [];
    }
  }

  return submissionNames.reduce(
    (acc, currentSubmissionName) => {
      const submission = accumulatedSubmissions[currentSubmissionName];

      if (!submission) {
        acc.submissionNamesNotFound.push(currentSubmissionName);
      } else if (submission.status === VaultStatus.PROBLEM) {
        acc.submissionNamesAlreadyUsed.push(currentSubmissionName);
      } else {
        acc.submissionsToReport.push({
          name: currentSubmissionName,
          confirmationCode: submission.confirmationCode,
        });
      }
      return acc;
    },
    {
      submissionsToReport: Array<{ name: string; confirmationCode: string }>(),
      submissionNamesAlreadyUsed: Array<string>(),
      submissionNamesNotFound: Array<string>(),
    }
  );
}

async function report(
  formId: string,
  submissionsToReport: { name: string; confirmationCode: string }[]
): Promise<void> {
  const request = new TransactWriteCommand({
    TransactItems: submissionsToReport.flatMap((submission) => {
      return [
        {
          Update: {
            TableName: "Vault",
            Key: {
              FormID: formId,
              NAME_OR_CONF: `NAME#${submission.name}`,
            },
            UpdateExpression:
              "SET #status = :status, ProblemTimestamp = :problemTimestamp REMOVE RemovalDate",
            ExpressionAttributeNames: {
              "#status": "Status",
            },
            ExpressionAttributeValues: {
              ":status": "Problem",
              ":problemTimestamp": Date.now(),
            },
          },
        },
        {
          Update: {
            TableName: "Vault",
            Key: {
              FormID: formId,
              NAME_OR_CONF: `CONF#${submission.confirmationCode}`,
            },
            UpdateExpression: "REMOVE RemovalDate",
          },
        },
      ];
    }),
  });

  await dynamoDBDocumentClient.send(request);
}

async function notifySupport(
  formId: string,
  submissionNames: string[],
  userEmailAddress: string,
  userDescription: string,
  language = "en"
): Promise<void> {
  const description = `
  User (${userEmailAddress}) reported problems with some of the submissions for form \`${formId}\`.<br/>
  <br/>
  Submission names:<br/>
  ${submissionNames.map((submissionName) => `\`${submissionName}\``).join(" ; ")}<br/>
  <br/>
  Description:<br/>
  ${userDescription}<br/>
  ****<br/>
  L'utilisateur (${userEmailAddress}) a signalé avoir rencontré des problèmes avec certaines des soumissions du formulaire \`${formId}\`.<br/>
  <br/>
  Nom des soumissions:<br/>
  ${submissionNames.map((submissionName) => `\`${submissionName}\``).join(" ; ")}<br/>
  <br/>
  Description:<br/>
  ${userDescription}<br/>
  `;

  const result = await createTicket({
    type: "problem",
    name: userEmailAddress,
    email: userEmailAddress,
    description,
    language,
  });

  if (result?.status >= 400) {
    throw new Error(
      `Freshdesk error: ${JSON.stringify(result)} - ${userEmailAddress} - ${description}`
    );
  }
}

interface APIProps {
  entries?: string[];
  description?: string;
  language?: string;
}

export const PUT = middleware(
  [sessionExists(), jsonValidator(downloadReportProblemSchema)],
  async (req, props) => {
    const { session } = props as WithRequired<MiddlewareProps, "session">;

    const userEmail = session.user.email;
    if (userEmail === null)
      throw new Error(
        `User does not have an associated email address: ${JSON.stringify(session.user)} `
      );

    const formId = props.params?.form;
    const { entries, description, language = "en" }: APIProps = props.body;

    if (Array.isArray(formId) || !formId || !Array.isArray(entries) || !description || !entries) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    if (entries.length > MAXIMUM_SUBMISSION_NAMES_PER_REQUEST) {
      return NextResponse.json(
        {
          error: `Too many submission names. Limit is ${MAXIMUM_SUBMISSION_NAMES_PER_REQUEST}.`,
        },
        { status: 400 }
      );
    }

    const ability = createAbility(session);

    // Ensure the user has owernship of this form
    try {
      await checkUserHasTemplateOwnership(ability, formId);
    } catch (e) {
      if (e instanceof AccessControlError) {
        logEvent(
          ability.userID,
          { type: "Form", id: formId },
          "AccessDenied",
          `Attempted to identify response problem without form ownership`
        );
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      logMessage.error(e as Error);
      return NextResponse.json({ error: "Error on server side" }, { status: 500 });
    }

    try {
      const submissionsFromSubmissionNames = await getSubmissionsFromSubmissionNames(
        formId,
        entries
      );

      if (submissionsFromSubmissionNames.submissionsToReport.length > 0) {
        await report(formId, submissionsFromSubmissionNames.submissionsToReport);
        // Note: may throw an error and handled in below catch e.g. if api key missing
        await notifySupport(
          formId,
          submissionsFromSubmissionNames.submissionsToReport.map((submission) => submission.name),
          userEmail,
          description,
          language
        );
        submissionsFromSubmissionNames.submissionsToReport.forEach((problem) =>
          logEvent(
            ability.userID,
            { type: "Response", id: problem.name },
            "IdentifyProblemResponse",
            `Identified problem response for form ${formId}`
          )
        );
      }

      return NextResponse.json({
        ...(submissionsFromSubmissionNames.submissionsToReport.length > 0 && {
          reportedSubmissions: submissionsFromSubmissionNames.submissionsToReport.map(
            (submission) => submission.name
          ),
        }),
        ...(submissionsFromSubmissionNames.submissionNamesAlreadyUsed.length > 0 && {
          submissionNamesAlreadyReported: submissionsFromSubmissionNames.submissionNamesAlreadyUsed,
        }),
        ...(submissionsFromSubmissionNames.submissionNamesNotFound.length > 0 && {
          invalidSubmissionNames: submissionsFromSubmissionNames.submissionNamesNotFound,
        }),
      });
    } catch (error) {
      if (error) {
        logMessage.error(
          `Failed to create ticket / contact the support team that user:${userEmail} reported problems with form submissions [${entries.map(
            (submissionName) => submissionName
          )}] on form \`${formId}\` at:${Date.now()}`
        );
      } else {
        logMessage.error(error as Error);
      }
      return NextResponse.json({ error: "Error on server side" }, { status: 500 });
    }
  }
);

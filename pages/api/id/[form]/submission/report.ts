import { NextApiRequest, NextApiResponse } from "next";
import { logMessage } from "@lib/logger";
import { middleware, cors, jsonValidator, sessionExists } from "@lib/middleware";
// import submissionNamesArraySchema from "@lib/middleware/schemas/submission-name-array.schema.json";
import downloadReportProblemSchema from "@lib/middleware/schemas/download-report-problem.schema.json";
import {
  BatchGetCommand,
  DynamoDBDocumentClient,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { MiddlewareProps, VaultStatus, WithRequired } from "@lib/types";
import { connectToDynamo } from "@lib/integration/dynamodbConnector";
import { getNotifyInstance } from "@lib/integration/notifyConnector";
import { createAbility, AccessControlError } from "@lib/privileges";
import { checkUserHasTemplateOwnership } from "@lib/templates";
import { logEvent } from "@lib/auditLogs";

const MAXIMUM_SUBMISSION_NAMES_PER_REQUEST = 20;

class FailedToSendEmailThroughGCNotify extends Error {}

const handler = async (req: NextApiRequest, res: NextApiResponse, props: MiddlewareProps) => {
  const { session } = props as WithRequired<MiddlewareProps, "session">;

  const userEmail = session.user.email;
  if (userEmail === null)
    throw new Error(
      `User does not have an associated email address: ${JSON.stringify(session.user)} `
    );

  const formId = req.query.form;

  if (
    Array.isArray(formId) ||
    !formId ||
    !Array.isArray(req.body.entries) ||
    !req.body.description
  ) {
    return res.status(400).json({ error: "Bad request" });
  }

  const submissionNames = req.body.entries as string[];

  const description: string = req.body.description;

  if (submissionNames.length > MAXIMUM_SUBMISSION_NAMES_PER_REQUEST) {
    return res.status(400).json({
      error: `Too many submission names. Limit is ${MAXIMUM_SUBMISSION_NAMES_PER_REQUEST}.`,
    });
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
      return res.status(403).json({ error: "Forbidden" });
    }
    logMessage.error(e as Error);
    return res.status(500).json({ error: "Error on server side" });
  }

  try {
    const dynamoDbClient = connectToDynamo();

    const submissionsFromSubmissionNames = await getSubmissionsFromSubmissionNames(
      formId,
      submissionNames,
      dynamoDbClient
    );

    if (submissionsFromSubmissionNames.submissionsToReport.length > 0) {
      await report(formId, submissionsFromSubmissionNames.submissionsToReport, dynamoDbClient);
      await notifySupport(
        formId,
        submissionsFromSubmissionNames.submissionsToReport.map((submission) => submission.name),
        userEmail,
        description
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

    return res.status(200).json({
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
    if (error instanceof FailedToSendEmailThroughGCNotify) {
      logMessage.error(
        `Failed to notify the support team that user:${userEmail} reported problems with form submissions [${submissionNames.map(
          (submissionName) => submissionName
        )}] on form \`${formId}\` at:${Date.now()}`
      );
    } else {
      logMessage.error(error as Error);
    }

    return res.status(500).json({ error: "Error on server side" });
  }
};

async function getSubmissionsFromSubmissionNames(
  formId: string,
  submissionNames: string[],
  dynamoDbClient: DynamoDBDocumentClient
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
    const response = await dynamoDbClient.send(request);

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
  submissionsToReport: { name: string; confirmationCode: string }[],
  dynamoDbClient: DynamoDBDocumentClient
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

  await dynamoDbClient.send(request);
}

async function notifySupport(
  formId: string,
  submissionNames: string[],
  userEmailAddress: string,
  description: string
): Promise<void> {
  try {
    const notifyClient = getNotifyInstance();

    // Here is the documentation for the `sendEmail` function: https://docs.notifications.service.gov.uk/node.html#send-an-email
    await notifyClient.sendEmail(process.env.TEMPLATE_ID, process.env.EMAIL_ADDRESS_SUPPORT, {
      personalisation: {
        subject: "Problem with form submissions / Problème avec les soumissions de formulaire",
        formResponse: `
  User (${userEmailAddress}) reported problems with some of the submissions for form \`${formId}\`.

  Submission names:
  ${submissionNames.map((submissionName) => `\`${submissionName}\``).join(" ; ")}

  Description:
  ${description}
  ****
  L'utilisateur (${userEmailAddress}) a signalé avoir rencontré des problèmes avec certaines des soumissions du formulaire \`${formId}\`.

  Nom des soumissions:
  ${submissionNames.map((submissionName) => `\`${submissionName}\``).join(" ; ")}

  Description:
  ${description}
  `,
      },
      reference: null,
    });
  } catch (error) {
    throw new FailedToSendEmailThroughGCNotify();
  }
}

export default middleware(
  [cors({ allowedMethods: ["PUT"] }), sessionExists(), jsonValidator(downloadReportProblemSchema)],
  handler
);

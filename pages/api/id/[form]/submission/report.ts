import { NextApiRequest, NextApiResponse } from "next";
import { logMessage } from "@lib/logger";
import { middleware, cors, jsonValidator, sessionExists } from "@lib/middleware";
import submissionNamesArraySchema from "@lib/middleware/schemas/submission-name-array.schema.json";
import {
  BatchGetCommand,
  DynamoDBDocumentClient,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { connectToDynamo } from "@lib/integration/dynamodbConnector";
import { NotifyClient } from "notifications-node-client";
import { checkOne } from "@lib/cache/flags";

class FailedToSendEmailThroughGCNotify extends Error {}

const handler = async (req: NextApiRequest, res: NextApiResponse, props: MiddlewareProps) => {
  // Is this feature / endpoint active
  const vaultActive = await checkOne("vault");
  if (!vaultActive) return res.status(404).json({ error: "Vault not active" });

  const { session } = props as WithRequired<MiddlewareProps, "session">;

  const userEmail = session.user.email;
  if (userEmail === null)
    throw new Error(
      `User does not have an associated email address: ${JSON.stringify(session.user)} `
    );

  const formId = req.query.form;

  if (Array.isArray(formId) || !formId) return res.status(400).json({ error: "Bad request" });

  const submissionNames = req.body as string[];

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
        userEmail
      );
    }

    logMessage.info(
      `user:${userEmail} reported a problem with form submissions [${submissionsFromSubmissionNames.submissionsToReport.map(
        (submission) => submission.name
      )}] for form ID:${formId} at:${Date.now()}`
    );

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
    [name: string]: { status: string; confirmationCode: string };
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
        return acc;
      } else if (submission.status === "Problem") {
        acc.submissionNamesAlreadyUsed.push(currentSubmissionName);
        return acc;
      } else {
        acc.submissionsToReport.push({
          name: currentSubmissionName,
          confirmationCode: submission.confirmationCode,
        });
        return acc;
      }
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
  userEmailAddress: string
): Promise<void> {
  try {
    const notifyClient = new NotifyClient(
      "https://api.notification.canada.ca",
      process.env.NOTIFY_API_KEY
    );

    // Here is the documentation for the `sendEmail` function: https://docs.notifications.service.gov.uk/node.html#send-an-email
    await notifyClient.sendEmail(process.env.TEMPLATE_ID, process.env.EMAIL_ADDRESS_SUPPORT, {
      personalisation: {
        subject: "Problem with form submissions / Problème avec les soumissions de formulaire",
        formResponse: `
  User (${userEmailAddress}) reported problems with some of the submissions for form \`${formId}\`.

  Submission names:
  ${submissionNames.map((submissionName) => `\`${submissionName}\``).join(" ; ")}
  ****
  L'utilisateur (${userEmailAddress}) a signalé avoir rencontré des problèmes avec certaines des soumissions du formulaire \`${formId}\`.

  Nom des soumissions:
  ${submissionNames.map((submissionName) => `\`${submissionName}\``).join(" ; ")}
  `,
      },
      reference: null,
    });
  } catch (error) {
    throw new FailedToSendEmailThroughGCNotify();
  }
}

export default middleware(
  [cors({ allowedMethods: ["PUT"] }), sessionExists(), jsonValidator(submissionNamesArraySchema)],
  handler
);

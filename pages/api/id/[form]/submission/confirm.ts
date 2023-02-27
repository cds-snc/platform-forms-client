import { NextApiRequest, NextApiResponse } from "next";
import { logMessage } from "@lib/logger";
import { middleware, cors, jsonValidator, sessionExists } from "@lib/middleware";
import uuidArraySchema from "@lib/middleware/schemas/uuid-array.schema.json";
import {
  DynamoDBDocumentClient,
  BatchGetCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { connectToDynamo } from "@lib/integration/dynamodbConnector";
import { checkOne } from "@lib/cache/flags";

const MAXIMUM_CONFIRMATION_CODES_PER_REQUEST = 20;

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

  if (Array.isArray(formId) || !formId || !Array.isArray(req.body)) {
    return res.status(400).json({ error: "Bad request" });
  }

  const confirmationCodes = req.body as string[];

  if (confirmationCodes.length > MAXIMUM_CONFIRMATION_CODES_PER_REQUEST) {
    return res.status(400).json({
      error: `Too many confirmation codes. Limit is ${MAXIMUM_CONFIRMATION_CODES_PER_REQUEST}.`,
    });
  }

  try {
    const dynamoDbClient = connectToDynamo();

    const submissionsFromConfirmationCodes = await getSubmissionsFromConfirmationCodes(
      formId,
      confirmationCodes,
      dynamoDbClient
    );

    if (submissionsFromConfirmationCodes.submissionsToConfirm.length > 0) {
      await confirm(formId, submissionsFromConfirmationCodes.submissionsToConfirm, dynamoDbClient);
    }

    logMessage.info(
      `user:${userEmail} confirmed form submissions [${submissionsFromConfirmationCodes.submissionsToConfirm.map(
        (submission) => submission.name
      )}] for form ID:${formId} at:${Date.now()}`
    );

    return res.status(200).json({
      ...(submissionsFromConfirmationCodes.submissionsToConfirm.length > 0 && {
        confirmedSubmissions: submissionsFromConfirmationCodes.submissionsToConfirm.map(
          (submission) => submission.confirmationCode
        ),
      }),
      ...(submissionsFromConfirmationCodes.confirmationCodesAlreadyUsed.length > 0 && {
        confirmationCodesAlreadyUsed: submissionsFromConfirmationCodes.confirmationCodesAlreadyUsed,
      }),
      ...(submissionsFromConfirmationCodes.confirmationCodesNotFound.length > 0 && {
        invalidConfirmationCodes: submissionsFromConfirmationCodes.confirmationCodesNotFound,
      }),
    });
  } catch (error) {
    logMessage.error(error as Error);
    return res.status(500).json({ error: "Error on server side" });
  }
};

async function getSubmissionsFromConfirmationCodes(
  formId: string,
  confirmationCodes: string[],
  dynamoDbClient: DynamoDBDocumentClient
): Promise<{
  submissionsToConfirm: { name: string; confirmationCode: string }[];
  confirmationCodesAlreadyUsed: string[];
  confirmationCodesNotFound: string[];
}> {
  const accumulatedSubmissions: {
    [confCode: string]: { name: string; removalDate?: number };
  } = {};

  let requestedKeys = confirmationCodes.map((code) => {
    return { FormID: formId, NAME_OR_CONF: `CONF#${code}` };
  });

  while (requestedKeys.length > 0) {
    const request = new BatchGetCommand({
      RequestItems: {
        Vault: {
          Keys: requestedKeys,
          ProjectionExpression: "#name,ConfirmationCode,RemovalDate",
          ExpressionAttributeNames: {
            "#name": "Name",
          },
        },
      },
    });

    // eslint-disable-next-line no-await-in-loop
    const response = await dynamoDbClient.send(request);

    if (response.Responses?.Vault) {
      response.Responses.Vault.forEach((record) => {
        accumulatedSubmissions[record["ConfirmationCode"]] = {
          name: record["Name"],
          removalDate: record["RemovalDate"],
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

  return confirmationCodes.reduce(
    (acc, currentConfirmationCode) => {
      const submission = accumulatedSubmissions[currentConfirmationCode];

      if (!submission) {
        acc.confirmationCodesNotFound.push(currentConfirmationCode);
      } else if (submission.removalDate) {
        acc.confirmationCodesAlreadyUsed.push(currentConfirmationCode);
      } else {
        acc.submissionsToConfirm.push({
          name: submission.name,
          confirmationCode: currentConfirmationCode,
        });
      }
      return acc;
    },
    {
      submissionsToConfirm: Array<{ name: string; confirmationCode: string }>(),
      confirmationCodesAlreadyUsed: Array<string>(),
      confirmationCodesNotFound: Array<string>(),
    }
  );
}

async function confirm(
  formId: string,
  submissionsToConfirm: { name: string; confirmationCode: string }[],
  dynamoDbClient: DynamoDBDocumentClient
): Promise<void> {
  const confirmationTimestamp = Date.now();
  const removalDate = confirmationTimestamp + 2592000000; // 2592000000 milliseconds = 30 days

  const request = new TransactWriteCommand({
    TransactItems: submissionsToConfirm.flatMap((submission) => {
      return [
        {
          Update: {
            TableName: "Vault",
            Key: {
              FormID: formId,
              NAME_OR_CONF: `NAME#${submission.name}`,
            },
            UpdateExpression:
              "SET #status = :status, ConfirmTimestamp = :confirmTimestamp, RemovalDate = :removalDate",
            ExpressionAttributeNames: {
              "#status": "Status",
            },
            ExpressionAttributeValues: {
              ":status": "Confirmed",
              ":confirmTimestamp": confirmationTimestamp,
              ":removalDate": removalDate,
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
            UpdateExpression: "SET RemovalDate = :removalDate",
            ExpressionAttributeValues: {
              ":removalDate": removalDate,
            },
          },
        },
      ];
    }),
  });

  await dynamoDbClient.send(request);
}

export default middleware(
  [cors({ allowedMethods: ["PUT"] }), sessionExists(), jsonValidator(uuidArraySchema)],
  handler
);

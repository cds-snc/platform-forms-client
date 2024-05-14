import { NextResponse } from "next/server";
import { logMessage } from "@lib/logger";
import { middleware, jsonValidator, sessionExists } from "@lib/middleware";
import uuidArraySchema from "@lib/middleware/schemas/uuid-array.schema.json";
import { BatchGetCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { dynamoDBDocumentClient } from "@lib/integration/awsServicesConnector";
import { AccessControlError, createAbility } from "@lib/privileges";
import { checkUserHasTemplateOwnership } from "@lib/templates";
import { logEvent } from "@lib/auditLogs";
import { DynamoDBServiceException } from "@aws-sdk/client-dynamodb";

async function getSubmissionsFromConfirmationCodes(
  formId: string,
  confirmationCodes: string[]
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
    const response = await dynamoDBDocumentClient.send(request);

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
  submissionsToConfirm: { name: string; confirmationCode: string }[]
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

  await sendWithExponentialBackoff(request);
}

async function sendWithExponentialBackoff(
  request: TransactWriteCommand,
  maxRetries = 3,
  baseDelay = 1000
) {
  let retryCount = 0;
  const execute = async (): Promise<unknown> => {
    try {
      return await dynamoDBDocumentClient.send(request);
    } catch (error) {
      if (
        error instanceof DynamoDBServiceException &&
        error.name === "ThrottlingException" &&
        retryCount < maxRetries
      ) {
        const delay = Math.pow(2, retryCount) * baseDelay;
        logMessage.warn(`Retrying after ${delay} milliseconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        retryCount++;
        return execute();
      } else {
        throw error; // Throw the error if it's not retryable or max retries exceeded
      }
    }
  };
  return execute();
}

export const PUT = middleware(
  [sessionExists(), jsonValidator(uuidArraySchema)],
  async (req, props) => {
    const { session } = props as WithRequired<MiddlewareProps, "session">;

    const userEmail = session.user.email;
    if (userEmail === null)
      throw new Error(
        `User does not have an associated email address: ${JSON.stringify(session.user)} `
      );

    const formId = props.params?.form;

    if (Array.isArray(formId) || !formId || !Array.isArray(props.body)) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const confirmationCodes = props.body;

    if (confirmationCodes.length > 50) {
      return NextResponse.json(
        { error: `Too many confirmation codes. API call limit is 50.` },
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
          `Attempted to confirm response without form ownership`
        );
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      logMessage.error(e as Error);
      return NextResponse.json({ error: "Error on server side" }, { status: 500 });
    }

    try {
      // max 100 confirmation codes per request
      const submissionsFromConfirmationCodes = await getSubmissionsFromConfirmationCodes(
        formId,
        confirmationCodes
      );

      if (submissionsFromConfirmationCodes.submissionsToConfirm.length > 0) {
        // max 50 submissions per request
        await confirm(formId, submissionsFromConfirmationCodes.submissionsToConfirm);
        // Done asychronously to not block response back to client
        submissionsFromConfirmationCodes.submissionsToConfirm.forEach((confirmation) =>
          logEvent(
            ability.userID,
            { type: "Response", id: confirmation.name },
            "ConfirmResponse",
            `Confirmed response for form ${formId}`
          )
        );
      }
      return NextResponse.json({
        ...(submissionsFromConfirmationCodes.submissionsToConfirm.length > 0 && {
          confirmedSubmissions: submissionsFromConfirmationCodes.submissionsToConfirm.map(
            (submission) => submission.confirmationCode
          ),
        }),
        ...(submissionsFromConfirmationCodes.confirmationCodesAlreadyUsed.length > 0 && {
          confirmationCodesAlreadyUsed:
            submissionsFromConfirmationCodes.confirmationCodesAlreadyUsed,
        }),
        ...(submissionsFromConfirmationCodes.confirmationCodesNotFound.length > 0 && {
          invalidConfirmationCodes: submissionsFromConfirmationCodes.confirmationCodesNotFound,
        }),
      });
    } catch (error) {
      logMessage.error(error as Error);
      return NextResponse.json({ error: "Error on server side" }, { status: 500 });
    }
  }
);

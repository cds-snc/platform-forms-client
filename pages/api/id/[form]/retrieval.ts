import { NextApiRequest, NextApiResponse } from "next";
import { logMessage } from "@lib/logger";
import { middleware, cors, validTemporaryToken, jsonValidator } from "@lib/middleware";
import retrievalSchema from "@lib/middleware/schemas/retrieval.schema.json";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  QueryCommandInput,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { MiddlewareProps } from "@lib/types";
import { getFileAttachments } from "@lib/fileAttachments";

/**
 * Handler for the retrieval API route. This function simply calls the relevant function depending on the HTTP method
 * @param req - The HTTP request object
 * @param res - The HTTP response object
 * @param email - The email of the user triggering the request
 * @param temporaryToken - The JWT token of the user triggering the request
 */
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  { email, temporaryToken }: MiddlewareProps
) => {
  const formID = req.query.form;
  if (Array.isArray(formID) || !formID) return res.status(400).json({ error: "Bad Request" });
  if (req.method === "DELETE") {
    await deleteFormResponses(req, res, formID, email, temporaryToken);
  } else {
    await getFormResponses(res, formID, email, temporaryToken);
  }
};

/**
 * Helper function to instantiate DynamoDB and Document client.
 * https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-example-document-client.html
 */
function connectToDynamo(): DynamoDBDocumentClient {
  //Create dynamodb client
  const db = new DynamoDBClient({
    region: process.env.AWS_REGION ?? "ca-central-1",
    endpoint: process.env.LOCAL_AWS_ENDPOINT,
  });

  return DynamoDBDocumentClient.from(db);
}

/**
 * Request type: GET
 * USAGE:
 * curl http://gc-forms/api/id/1/retrieval
   -H "Accept: application/json"
   -H "Authorization: Bearer {token}"

 * This method will fetch up to 10 form responses and return them to the user
 * @param res - The NextJS response object
 * @param formID - The form ID from which to retrieve responses
 * @param email - The email of the authenticated user carrying out the request
 * @param temporaryToken - The valid JWT temporary token of the authenticated user carrying out the request
 */
async function getFormResponses(
  res: NextApiResponse,
  formID: string,
  email?: string,
  temporaryToken?: string
): Promise<void> {
  try {
    const documentClient = connectToDynamo();

    let accumulatedResponses: { [key: string]: unknown }[] = [];
    let lastEvaluatedKey = null;

    while (lastEvaluatedKey !== undefined) {
      //Create form's responses db param
      //NB: A filter expression is applied after a Query finishes, but before the results are returned.
      //Therefore, a Query consumes the same amount of read capacity, regardless of whether a filter expression is present.
      const getItemsDbParams: QueryCommandInput = {
        TableName: "Vault",
        IndexName: "retrieved-index",
        // Just being smart and try to get just what we need to get to a maximum of 10 responses
        Limit: 10 - accumulatedResponses.length,
        ExclusiveStartKey: lastEvaluatedKey ?? undefined,
        //Cannot use partitin key or sort key such as formID and Retrieved attribute in keyConditionExpression simultaneously
        ExpressionAttributeValues: {
          ":formID": formID,
          ":retrieved": 0,
        },
        KeyConditionExpression: "Retrieved = :retrieved",
        FilterExpression: "FormID = :formID",
        //A filter expression cannot contain partition key or sort key attributes.
        //You need to specify those attributes in the key condition expression, not the filter expression.
        ProjectionExpression: "FormID,SubmissionID,FormSubmission,Retrieved,SecurityAttribute",
      };
      const queryCommand = new QueryCommand(getItemsDbParams);
      // eslint-disable-next-line no-await-in-loop
      const response = await documentClient.send(queryCommand);

      if (response.Items?.length) {
        accumulatedResponses = accumulatedResponses.concat(
          response.Items.map(
            ({
              FormID: formID,
              SubmissionID: submissionID,
              FormSubmission: formSubmission,
              SecurityAttribute: securityAttribute,
            }) => ({
              formID,
              submissionID,
              formSubmission,
              fileAttachments: getFileAttachments(submissionID, formSubmission),
              securityAttribute,
            })
          )
        );
      }

      // We either manually stop the paginated request when we have 10 or more items or we let it finish on its own
      if (accumulatedResponses.length >= 10) {
        lastEvaluatedKey = undefined;
      } else {
        lastEvaluatedKey = response.LastEvaluatedKey;
      }
    }

    logMessage.info(
      `user:${email} retrieved form responses [${accumulatedResponses.map(
        (response) => response.submissionID
      )}] from form ID:${formID} at:${Date.now()} using token:${temporaryToken}`
    );

    return res.status(200).json({ responses: accumulatedResponses });
  } catch (error) {
    logMessage.error(error as Error);
    res.status(500).json({ error: "Error on Server Side when fetching form's responses" });
  }
}

/**
 * Request type: DELETE
 * curl -X DELETE http://gc-forms/api/id/1/retrieval
     -H "Content-Type: application/json"
     -d '["submissionID1", "submissionID2"]'
 * This method will delete the specified form responses
 * @param req - The NextJS request object
 * @param res - The NextJS response object
 * @param formID - The form ID from which to retrieve responses
 * @param email - The email of the authenticated user carrying out the request
 * @param temporaryToken - The valid JWT temporary token of the authenticated user carrying out the request
 */
async function deleteFormResponses(
  req: NextApiRequest,
  res: NextApiResponse,
  formID: string,
  email?: string,
  temporaryToken?: string
) {
  // get body from request
  const requestBody = req.body as string[];
  const submissionIDlist: string[] = [];
  try {
    const documentClient = connectToDynamo();
    //Setting Retrieved to 1. DynamoDB stream will trigger archival lambda
    for (const submissionID of requestBody) {
      const updateItem = {
        TableName: "Vault",
        Key: {
          SubmissionID: submissionID,
          FormID: formID,
        },
        UpdateExpression: "SET Retrieved = :retrieved",
        ConditionExpression: "SubmissionID = :submission",
        ExpressionAttributeValues: {
          ":retrieved": 1,
          ":submission": submissionID,
        },
        ReturnValues: "NONE",
      };
      //Update one item at the time
      // eslint-disable-next-line no-await-in-loop
      await documentClient.send(new UpdateCommand(updateItem));
      submissionIDlist.push(submissionID);
    }

    logMessage.info(
      `user:${email} marked form responses [${submissionIDlist}] from form ID:${formID} as retrieved at:${Date.now()} using token:${temporaryToken}`
    );

    //Return responses data
    return res.status(200).json(submissionIDlist);
  } catch (error) {
    logMessage.warn("Some submissions were potentially not marked as retrieved");
    logMessage.warn(
      submissionIDlist
        ? `The following submissions were not marked as retrieved: [${requestBody.filter(
            (submissionID) => !submissionIDlist.includes(submissionID)
          )}]`
        : `[${requestBody.toString()}]`
    );
    logMessage.error(error as Error);
    return res.status(500).json({ error: "Error on Server Side" });
  }
}

// Removing access for all Methods until this API is ready for use.
export default middleware(
  [cors({ allowedMethods: [] }), validTemporaryToken(), jsonValidator(retrievalSchema)],
  handler
);

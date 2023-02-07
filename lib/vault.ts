import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  QueryCommandInput,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { getFileAttachments } from "@lib/fileAttachments";
import { VaultSubmission } from "./types/retrieval-types";

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
 * This method returns a list of all form submission records.
 * The list does not contain the acutal submission data, only attributes
 * @param formID - The form ID from which to retrieve responses
 */
export async function getAllSubmissionsList(formID: string): Promise<VaultSubmission[]> {
  const documentClient = connectToDynamo();

  let accumulatedResponses: VaultSubmission[] = [];
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
      ProjectionExpression:
        "FormID,SubmissionID,Retrieved,Status,SecurityAttribute,ConfirmationCode,ResponseID,CreatedAt",
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
  return accumulatedResponses;
}

/**
 * This method will fetch up to 10 form responses and return them in an array
 * @param formID - The form ID from which to retrieve responses
 */
export async function getUnconfirmedSubmissions(formID: string): Promise<VaultSubmission[]> {
  const documentClient = connectToDynamo();

  let accumulatedResponses: VaultSubmission[] = [];
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
      ProjectionExpression:
        "FormID,SubmissionID,FormSubmission,Retrieved,Status,SecurityAttribute,ConfirmationCode,ResponseID,CreatedAt",
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
  return accumulatedResponses;
}

/**
 * This method will confirm the specified form responses
 * @param req - The NextJS request object
 * @param res - The NextJS response object
 * @param formID - The form ID from which to retrieve responses
 * @param confirmationCodes - An array of confirmaiton IDs to be confirmed
 */
export async function confirmVaultSubmissions(formID: string, confirmationCodes: string[]) {
  // get body from request

  const confirmedSubmissions: string[] = [];

  const documentClient = connectToDynamo();
  // get submission ID's from confirmation Codes

  // Connect with Clement to see function progress

  //Setting Retrieved to 1. DynamoDB stream will trigger archival lambda
  for (const confirmationCode of confirmationCodes) {
    const updateItem = {
      TableName: "Vault",
      Key: {
        ConfirmationCode: confirmationCode,
        FormID: formID,
      },
      UpdateExpression: "SET Retrieved = :retrieved",
      ConditionExpression: "ConfirmationCode = :code",
      ExpressionAttributeValues: {
        ":retrieved": 1,
        ":code": confirmationCode,
      },
      ReturnValues: "NONE",
    };
    //Update one item at the time
    // eslint-disable-next-line no-await-in-loop
    await documentClient.send(new UpdateCommand(updateItem));
    confirmedSubmissions.push(confirmationCode);
  }

  //Return responses data
  return confirmedSubmissions;
}

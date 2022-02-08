import { NextApiRequest, NextApiResponse } from "next";
import isRequestAllowed from "@lib/middleware/httpRequestAllowed";
import { logMessage } from "@lib/logger";
import {
  DynamoDBClient,
  QueryCommand,
  UpdateItemCommand,
  QueryCommandOutput,
} from "@aws-sdk/client-dynamodb";
import checkIfValidTemporaryToken from "@lib/middleware/httpRequestHasValidTempToken";

/**
 * @description
 * Request type: GET
 * USAGE: 
 * curl http://gc-forms/api/retrieval?maxRecords=10&formID=1
   -H "Accept: application/json"
   -H "Authorization: Bearer {token}"

 * - The maxRecords exists and it ranges between 1 and 10.
 * Will fetch form's responses up to the maximum number (maxRecords) that was specified.
 * It will return form's reponses but also mark those responses as retrieved by updating the attribute Retrieved
 * from 0 to 1.
 * @param res 
 * @param formID 
 * @param maxRecords 
 * @returns 
 */
async function getFormResponses(
  req: NextApiRequest,
  res: NextApiResponse,
  formID: string
): Promise<void> {
  //Default value to 10 if it's undefined
  const { maxRecords = "10" } = req.query;
  //Check maxRecords aren't repeated
  if (Array.isArray(maxRecords) || !formID) return res.status(400).json({ error: "Bad Request" });
  const expectedMaxRecords = parseInt(maxRecords);
  //Range is 1- 10
  if (expectedMaxRecords < 1 || expectedMaxRecords > 10) {
    return res.status(400).json({ error: "Invalid paylaod value found maxRecords" });
  }
  //A list to store submissionIDs
  let submissionIDlist: (string | undefined)[] = [];
  let formResponses: QueryCommandOutput;
  let db: DynamoDBClient;
  try {
    //Create dynamodb client
    db = new DynamoDBClient({ region: process.env.AWS_REGION ?? "ca-central-1" });
    //Create form's responses db param
    //NB: A filter expression is applied after a Query finishes, but before the results are returned.
    //Therefore, a Query consumes the same amount of read capacity, regardless of whether a filter expression is present.
    const getItemsDbParams = {
      TableName: "Vault",
      IndexName: "retrieved-index",
      Limit: expectedMaxRecords,
      //Cannot use partitin key or sort key such as formID and Retrieved attribute in keyConditionExpression simultaneously
      KeyConditionExpression: "Retrieved = :zero",
      ExpressionAttributeValues: { ":formID": { S: formID }, ":zero": { N: "0" } },
      //A filter expression cannot contain partition key or sort key attributes.
      //You need to specify those attributes in the key condition expression, not the filter expression.
      FilterExpression: "FormID = :formID",
      ProjectionExpression: "FormID,SubmissionID,FormSubmission,Retrieved",
    };
    //Get form's responses for formID
    formResponses = await db.send(new QueryCommand(getItemsDbParams));
  } catch (error) {
    logMessage.error(error);
    return res
      .status(500)
      .json({ responses: "Error on Server Side when fetching form's responses" });
  }
  try {
    //Collecting items submissionIDs for logging and updating items.
    submissionIDlist =
      formResponses?.Items?.map((response) => {
        return response.SubmissionID.S;
      }) ?? [];
    if (formResponses.Count && formResponses.Count > 0) {
      //Preparing a query to set records's attribute Retrieved to 1.
      for (const submissionID of submissionIDlist as string[]) {
        //Create a new update object statement
        const updateItem = {
          TableName: "Vault",
          Key: {
            SubmissionID: {
              S: submissionID,
            },
            FormID: {
              S: formID,
            },
          },
          UpdateExpression: "SET Retrieved = :retrieved",
          ConditionExpression: "SubmissionID = :submission",
          ExpressionAttributeValues: {
            ":retrieved": { N: "1" },
            ":submission": { S: submissionID },
          },
          ReturnValues: "NONE",
        };
        //Update one item at the time
        await db?.send(new UpdateItemCommand(updateItem));
      }
    }
    //Return responses data
    return res.status(200).json({ responses: formResponses.Items });
  } catch (error) {
    logMessage.warn(`Possible data loss for these submissionIDs`);
    //print submission ids as string
    logMessage.warn(submissionIDlist ? submissionIDlist.toString() : "Empty submissionID list");
    logMessage.error(error);
    return res.status(500).json({ responses: "Error on Server Side" });
  }
}

// Only a GET request is allowed
export default isRequestAllowed(["GET"], checkIfValidTemporaryToken(getFormResponses));

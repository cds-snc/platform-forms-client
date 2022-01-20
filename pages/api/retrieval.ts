import { NextApiRequest, NextApiResponse } from "next";
import isRequestAllowed from "@lib/middleware/httpRequestAllowed";
import { logMessage } from "@lib/logger";
import { DynamoDBClient, QueryCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { FormUserDBConfigProperties, BearerTokenPayload } from "@lib/types";
import { getBearerToken } from "@lib/middleware/bearerToken";
import executeQuery from "@lib/integration/queryManager";
import dbConnector from "@lib/integration/dbConnector";
import { QueryResult } from "pg";
import jwt from "jsonwebtoken";

/**
 * Request verd : GET
 * A sample url to test this endpoint:
 * USAGE: 
 * curl http://localhost:3000/api/retrieval?maxRecords=10&formID=1
   -H "Accept: application/json"
   -H "Authorization: Bearer {token}"
 * 
 * This method fetchs form responses up to the maximum number (maxRecords) that was specified.
 * It required to have a valid bearer token which must carry a valid formID. When all these conditons are met,
 * Not only it should return form reponses but also mark those responses as retrieved by updating the attribute Retrieved
 * from 0 to 1.
 * @param res 
 * @param formID 
 * @param maxRecords 
 * @returns 
 */
export async function getFormResponses(
  res: NextApiResponse,
  formID: string,
  maxRecords: number
): Promise<void> {
  //A list to store submissionIDs
  let submissionIDlist: (string | undefined)[] | undefined = [];
  try {
    //Create dynamodb client
    const db = new DynamoDBClient({ region: process.env.AWS_REGION ?? "ca-central-1" });
    //Create form responses db param
    //NB: A filter expression is applied after a Query finishes, but before the results are returned.
    //Therefore, a Query consumes the same amount of read capacity, regardless of whether a filter expression is present.
    const getItemsDbParams = {
      TableName: "Vault",
      IndexName: "retrieved-index",
      Limit: maxRecords,
      //Cannot use partitin key or sort key such as formID and Retrieved attribute in keyConditionExpression simultaneously
      KeyConditionExpression: "Retrieved = :zero",
      ExpressionAttributeValues: { ":formID": { S: formID }, ":zero": { N: "0" } },
      //A filter expression cannot contain partition key or sort key attributes.
      //You need to specify those attributes in the key condition expression, not the filter expression.
      FilterExpression: "FormID = :formID",
      ProjectionExpression: "FormID,SubmissionID,FormSubmission,Retrieved",
    };
    //Get form's responses for formID
    const formResponses = await db.send(new QueryCommand(getItemsDbParams));
    //Collecting items submissionIDs for logging and updating items.
    submissionIDlist = formResponses?.Items?.map((response) => {
      return response.SubmissionID.S;
    });
    if (formResponses && formResponses.Count && formResponses.Count > 0) {
      //Preparing a query to set records's attribute Retrieved to 1.
      for (const submissionID of submissionIDlist as string[]) {
        //Create a new statement object
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
        await db.send(new UpdateItemCommand(updateItem));
      }
    }
    //Return form data
    return res.status(200).json({ responses: formResponses.Items });
  } catch (error) {
    //logging submissionIDs
    logMessage.warn(`Possible data loss for these submissionIDs`);
    //print submission ids as string
    logMessage.warn(submissionIDlist ? submissionIDlist.toString() : "Empty submissionID list");
    logMessage.error(error);
    return res.status(500).json({ responses: "Error on Server Side" });
  }
}

/**
 * This method will make sure that the incoming request is valid by enforcing a set of
 * rules.
 * Request parameters :
 *  - The maxRecords exists and ranges between 1 and 10.
 *  - A formID exists and is valid i.e 78
 * BearerToken :
 *  - Must contains an email address
 *  - It has not expired
 *  - It exists in our Database
 *  - The record found in the database includes the email, active, and template_id fields
 *  - The email on the token record matches the email in the payload.
 *  - The active flag boolean is true.
 * @param handler - A method to retrieve a form responses
 * @returns
 */
export const formResponsesReqValidator = (
  handler: (res: NextApiResponse, formID: string, maxRecords: number) => void
) => {
  return async function (req: NextApiRequest, res: NextApiResponse): Promise<unknown> {
    try {
      //Default value to zero if it's undefined
      const { maxRecords = 10, formID } = req.query;
      //Get formID form the baerer token
      if (!formID) return res.status(400).json({ error: "Bad Request" });
      //Check an empty string before proceding
      const expectedMaxRecords = parseInt(!maxRecords ? "10" : (maxRecords as string));
      //Range is 1- 10
      if (expectedMaxRecords < 1 || expectedMaxRecords > 10) {
        return res.status(400).json({ error: "Invalid paylaod value found maxRecords" });
      }
      //Get token from request
      const token = getBearerToken(req);
      //Verify the token
      const bearerTokenPayload = jwt.verify(
        token,
        process.env.TOKEN_SECRET || ""
      ) as BearerTokenPayload;
      const { email } = bearerTokenPayload;
      //Checking if a formUserRecord exists for the given bearerToken.
      const formUserRecord = (
        await getFormUserRecordByFormIDAndEmail(formID as string, email as string)
      ).rows[0] as FormUserDBConfigProperties;
      if (formUserRecord?.active) {
        //Moving forward to fetch form's responses
        return handler(res, formID as string, expectedMaxRecords);
      } else {
        return res.status(403).json({ error: "Missing or invalid bearer token." });
      }
    } catch (err) {
      //Token verification
      res.status(403).json({ error: "Missing or invalid bearer token or unknown error." });
    }
  };
};
/**
 * It returns an active record from form_users table base upon a formID/template_id and an email.
 * @param formID - The id of the form
 * @param email - The email that is associated to the formID
 * @returns A form_user's record
 */
export const getFormUserRecordByFormIDAndEmail = async (
  formID: string,
  email: string
): Promise<QueryResult> => {
  //Retrieving a tokenRecord or return an empty array
  return executeQuery(
    await dbConnector(),
    "SELECT * FROM form_users WHERE template_id = ($1) and email = ($2) and active = true",
    [formID, email]
  );
};
// Only a GET request is allowed
export default isRequestAllowed(["GET"], formResponsesReqValidator(getFormResponses));

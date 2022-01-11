import { NextApiRequest, NextApiResponse } from "next";
import isRequestAllowed from "@lib/middleware/httpRequestAllowed";
import { logMessage } from "@lib/logger";
import { DynamoDBClient, QueryCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { BearerTokenPayload } from "@lib/types";
import validate from "@lib/middleware/bearerToken";

/**
 * EntryPoint of retrieval Api. It carries a request to the right method
 * otherwise returns 500 error status code.
 * @param req
 * @param res
 * @param bearerTokenPayload
 * @returns
 */
const retrieval = async (
  req: NextApiRequest,
  res: NextApiResponse,
  options?: unknown
): Promise<void> => {
  try {
    return await getFormResponses(req, res, options as BearerTokenPayload);
  } catch (err) {
    logMessage.error(err);
    res.status(500).json({ error: "Error on Server Side" });
  }
};

/**
 * This method fetchs form responses up to the maximum number (maxRecords) that was specified.
 * It required to have a valid bearer token which must carry a valid formID. When all these conditons are met,
 * Not only it should return form reponses but also mark those responses as retrieved by updating the attribute Retrieved
 * from 0 to 1.
 * @param req
 * @param res
 */
export async function getFormResponses(
  req: NextApiRequest,
  res: NextApiResponse,
  bearerTokenPayload: BearerTokenPayload
): Promise<void> {
  const { maxRecords } = req.query;
  if (!maxRecords || parseInt(maxRecords as string) < 0 || parseInt(maxRecords as string) >= 11) {
    return res.status(400).json({ error: "Invalid paylaod value found maxRecords" });
  } else {
    //Get formID form the baerer token
    const formID = bearerTokenPayload?.formID;
    if (!formID) return res.status(404).json({ error: "Bad Request" });
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
        Limit: parseInt(maxRecords as string),
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
      for (const subID in submissionIDlist) logMessage.warn(subID);
      logMessage.error(error);
      return res.status(500).json({ responses: "Error on Server Side" });
    }
  }
}
export default isRequestAllowed(["GET"], validate(retrieval));

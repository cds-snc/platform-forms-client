import { NextApiRequest, NextApiResponse } from "next";
import { isAdmin } from "@lib/auth";
import jwt from "jsonwebtoken";
import { logMessage } from "@lib/logger";
import executeQuery from "@lib/integration/queryManager";
import { cors, sessionExists, middleware } from "@lib/middleware";
import dbConnector from "@lib/integration/dbConnector";
import { QueryResult } from "pg";
import { logAdminActivity } from "@lib/adminLogs";
import { BearerResponse } from "@lib/types";
import { AdminLogAction, AdminLogEvent } from "@lib/types/utility-types";

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  if (req.method === "GET") {
    try {
      return await getToken(req, res);
    } catch (err) {
      logMessage.error(err as Error);
      return res.status(500).json({ error: "Internal Service Error" });
    }
  } else if (req.method === "POST") {
    try {
      return await createToken(req, res);
    } catch (err) {
      logMessage.error(err as Error);
      return res.status(500).json({ error: "Internal Service Error" });
    }
  }
};

/**
 * This function when called will create or refresh a token for a specific form
 * If the form is not found it will return a 404 response. Otherwise a 200 status
 * code will be returned
 * @param req The request object containing data of the request
 * @param res The response object containing all that is needed to return a response
 */
export async function createToken(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const formID = req.query.form as string;
  if (formID) {
    // get the session which is important for traceability purposes in logs
    const session = await isAdmin({ req });
    // create the bearer token with the payload being the form ID
    // and signed by the token secret. The expiry time for this token is set to be one
    // year
    const token = jwt.sign(
      {
        formID,
      },
      process.env.TOKEN_SECRET as string,
      {
        expiresIn: "1y",
      }
    );
    // update the row with the new bearer token
    // return the id and the updated bearer_token field
    const responseObject = await executeQuery(
      await dbConnector(),
      'UPDATE templates SET bearer_token = ($1) WHERE id = ($2) RETURNING bearer_token as "bearerToken"',
      [token, formID]
    );
    // if we do not have any rows this means the record was not found return a 404
    if (responseObject.rowCount === 0) {
      logMessage.warn(
        `A bearer token was attempted to be created for form ${formID} by user ${session?.user?.name} but the form does not exist`
      );
      return res.status(404).json({ error: "Not Found" });
    }
    // return the record with the id and the updated bearer token. Log the success
    logMessage.info(
      `A bearer token was refreshed for form ${formID} by user ${session?.user?.name}`
    );

    if (session && session.user.id) {
      await logAdminActivity(
        session.user.id,
        AdminLogAction.Update,
        AdminLogEvent.RefreshBearerToken,
        `Bearer token for form id: ${formID} has been refreshed`
      );
    }

    return res.status(200).json(responseObject.rows[0]);
  }
  return res.status(400).json({ error: "form ID parameter was not provided in the resource path" });
}

/**
 * Will return a bearer token if there is one associated with a given formID
 * It might return a Not found (404) if token doest exist ( undefined or null)
 * otherwise 400 as status code.
 * @param req The request object containing data of the request
 * @param res The response object containing all that is needed to return a response
 */
export async function getToken(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const formID = req.query.form as string;
  if (formID) {
    //Fetching the token return list of object or an empty array
    const resultObject = await getTokenById(formID);
    const data = resultObject.rowCount > 0 ? resultObject.rows : [];
    if (data && data.length > 0) {
      const { bearerToken } = data[0] as unknown as BearerResponse;
      return res.status(200).json({ bearerToken: bearerToken });
    }
    // otherwise the resource was not found
    return res.status(404).json({ error: "Not Found" });
  }
  return res.status(400).json({ error: "form ID parameter was not provided in the resource path" });
}

/**
 * Will return the query including the bearerToken from the database
 * @param formID - The id of the form
 * @returns the query result
 */
export const getTokenById = async (formID: string): Promise<QueryResult> => {
  //Fetching the token return list of object or an empty array
  return executeQuery(
    await dbConnector(),
    'SELECT bearer_token as "bearerToken" FROM templates WHERE id = ($1)',
    [formID]
  );
};

export default middleware([cors({ allowedMethods: ["GET", "POST"] }), sessionExists()], handler);

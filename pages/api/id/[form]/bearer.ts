import { NextApiRequest, NextApiResponse } from "next";
import { isAdmin } from "@lib/auth";
import jwt from "jsonwebtoken";
import { logMessage } from "@lib/logger";
import { prisma } from "@lib/integration/prismaConnector";
import { cors, sessionExists, middleware } from "@lib/middleware";
import { logAdminActivity, AdminLogAction, AdminLogEvent } from "@lib/adminLogs";
import { Prisma } from "@prisma/client";

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
    try {
      const updatedBearerToken = await prisma.template.update({
        where: {
          id: formID,
        },
        data: {
          bearerToken: token,
        },
        select: {
          id: true,
          bearerToken: true,
        },
      });

      // return the record with the id and the updated bearer token. Log the success
      logMessage.info(
        `A bearer token was refreshed for form ${formID} by user ${session?.user?.name}`
      );
      if (session && session.user.userId) {
        await logAdminActivity(
          session.user.userId,
          AdminLogAction.Update,
          AdminLogEvent.RefreshBearerToken,
          `Bearer token for form id: ${formID} has been refreshed`
        );
      }
      return res.status(200).json(updatedBearerToken);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
        logMessage.warn(
          `A bearer token was attempted to be created for form ${formID} by user ${session?.user?.name} but the form does not exist`
        );
        return res.status(404).json({ error: "Not Found" });
      }
      // Continue the error chain if it isn't an object not found error
      throw e;
    }
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
    //Fetching the token returns the bearer token or null.
    const result = await getTokenById(formID);
    if (typeof result?.bearerToken !== "undefined") {
      return res.status(200).json({ bearerToken: result.bearerToken });
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
export const getTokenById = async (
  formID: string
): Promise<{ bearerToken: string | null } | null> => {
  return await prisma.template.findUnique({
    where: {
      id: formID,
    },
    select: {
      bearerToken: true,
    },
  });
};

export default middleware([cors({ allowedMethods: ["GET", "POST"] }), sessionExists()], handler);

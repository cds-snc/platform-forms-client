import dbConnector from "@lib/integration/dbConnector";
import executeQuery from "@lib/integration/queryManager";
import { logMessage } from "@lib/logger";

import { middleware, cors, validBearerToken } from "@lib/middleware";

import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { QueryResult } from "pg";
import { NotifyClient } from "notifications-node-client";
import { MiddlewareProps } from "@lib/types";

/**
 * Verifies that the payload for the request is valid.
 *
 * @param req - the api request
 * @param res - the api response
 * @param bearerTokenPayload - the payload from the bearer token used in the authorization
 * @param email - the email for the user making the request, found in the body of the api request
 * @returns a promise
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, { formID }: MiddlewareProps) => {
  try {
    if (formID == undefined) {
      return res.status(403).json({ error: "Invalid form request." });
    }
    if (!process.env.TOKEN_SECRET) {
      return res.status(500).json({ error: "Server cannot respond at this time" });
    }

    const email = req.body["email"];
    if (!email) {
      res.status(400).json({ error: "Invalid payload" });
    }

    const temporaryToken = createTemporaryToken(email, process.env.TOKEN_SECRET);
    await updateTemporaryToken(temporaryToken, email, formID);
    await sendTemporaryTokenByEmail(email, temporaryToken);

    logMessage.info(`Temporary Token Requested: Form ID: ${formID} Email: ${email}`);
    res.status(200).json({ message: "success" });
  } catch (error) {
    logMessage.error("Failed to generate temporary token.");

    let errorMessage = "Malformed API Request";

    if ((error as Error).message.includes("Could not send temporary token by email")) {
      errorMessage = "GC Notify service failed to send temporary token";
    }

    res.status(500).json({ error: errorMessage });
  }
};

/**
 * Create and return a JWT with a short expiry date
 * @param email - The email for the user making the request
 * @param tokenSecret - The token secret needed to sign
 * @returns a JWT string
 *
 * @throws
 * This exception is thrown if the tokenSecret is invalid
 */
const createTemporaryToken = (email: string, tokenSecret: string): string => {
  if (tokenSecret?.length > 0) {
    return jwt.sign(
      {
        email: email,
      },
      tokenSecret,
      { expiresIn: "7d" }
    );
  } else {
    throw new Error("Could not create temporary token: Invalid token secret.");
  }
};

/**
 * Save a temporary token to the form_users table in the database for a specific user and form
 * @param temporaryToken
 * @param email
 * @param templateId
 * @returns the query result
 */
const updateTemporaryToken = async (
  temporaryToken: string,
  email: string,
  templateId: string
): Promise<QueryResult> => {
  return executeQuery(
    await dbConnector(),
    "UPDATE form_users SET temporary_token = ($1), updated_at = current_timestamp WHERE email = ($2) and template_id = ($3) and active = true",
    [temporaryToken, email, templateId]
  );
};

const sendTemporaryTokenByEmail = async (email: string, temporaryToken: string) => {
  const sendTempTokenTemplateID = process.env.TEMPORARY_TOKEN_TEMPLATE_ID;
  const notifyClient = new NotifyClient(
    "https://api.notification.canada.ca",
    process.env.NOTIFY_API_KEY
  );

  // Here is the documentation for the `sendEmail` function: https://docs.notifications.service.gov.uk/node.html#send-an-email
  return await notifyClient
    .sendEmail(sendTempTokenTemplateID, email, {
      personalisation: {
        temporaryToken: `\`${temporaryToken}\``,
      },
      reference: null,
    })
    .catch((error: Error) => {
      logMessage.error(error);
      throw new Error("Could not send temporary token by email.");
    });
};

export default middleware([cors({ allowedMethods: ["POST"] }), validBearerToken()], handler);

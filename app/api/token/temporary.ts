import { prisma } from "@lib/integration/prismaConnector";
import { Prisma } from "@prisma/client";
import { logMessage } from "@lib/logger";

import { middleware, cors } from "@lib/middleware";

import jwt, { TokenExpiredError } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { getNotifyInstance } from "@lib/integration/notifyConnector";
import { BearerTokenPayload } from "@lib/types";
import {
  isUserLockedOut,
  registerFailedLoginAttempt,
  registerSuccessfulLoginAttempt,
} from "@lib/lockout";
import { extractBearerTokenFromReq } from "@lib/middleware/validTemporaryToken";

/**
 * Verifies that the payload for the request is valid.
 *
 * @param req - the api request
 * @param res - the api response
 * @param bearerTokenPayload - the payload from the bearer token used in the authorization
 * @param email - the email for the user making the request, found in the body of the api request
 * @returns a promise
 */
const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  if (!process.env.TOKEN_SECRET) {
    return res.status(500).json({ error: "Server cannot respond at this time" });
  }

  const email: string | undefined = req.body["email"];

  if (!email) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  try {
    const lockoutResponse = await isUserLockedOut(email);

    if (lockoutResponse.isLockedOut) {
      return res
        .status(401)
        .json(
          buildUserLockedOutErrorMessage(
            lockoutResponse.remainingNumberOfAttemptsBeforeLockout,
            lockoutResponse.numberOfSecondsBeforeLockoutExpires
          )
        );
    }

    const formID = await hasValidFormAccessToken(req, process.env.TOKEN_SECRET);
    const temporaryToken = createTemporaryToken(email, formID, process.env.TOKEN_SECRET);
    await updateTemporaryToken(temporaryToken, email, formID);
    await sendTemporaryTokenByEmail(email, temporaryToken);

    await registerSuccessfulLoginAttempt(email);

    logMessage.info(`Temporary Token Requested: Form ID: ${formID} Email: ${email}`);

    return res.status(200).json({ message: "success" });
  } catch (error) {
    const errorMessage = (error as Error).message;

    if (
      errorMessage.includes("User is not found or not active") ||
      errorMessage.includes("Form access token is invalid")
    ) {
      const lockoutResponse = await registerFailedLoginAttempt(email);
      return res
        .status(401)
        .json(
          buildUserLockedOutErrorMessage(
            lockoutResponse.remainingNumberOfAttemptsBeforeLockout,
            lockoutResponse.numberOfSecondsBeforeLockoutExpires
          )
        );
    }

    logMessage.error("Failed to generate temporary token.");
    logMessage.error(error);

    return res.status(500).json({ error: "Internal error" });
  }
};

async function hasValidFormAccessToken(req: NextApiRequest, tokenSecret: string): Promise<string> {
  try {
    const token = extractBearerTokenFromReq(req);
    const { formID } = jwt.verify(token, tokenSecret) as BearerTokenPayload;
    const tokenID = await prisma.template.findUnique({
      where: {
        id: formID,
      },
      select: {
        bearerToken: true,
      },
    });

    if (tokenID?.bearerToken === token) return formID;
    else throw new Error("Form access token is invalid.");
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      logMessage.warn("An expired bearer token has been used.");
    }

    throw new Error("Form access token is invalid.");
  }
}

/**
 * Create and return a JWT with a short expiry date
 * @param email - The email for the user making the request
 * @param tokenSecret - The token secret needed to sign
 * @returns a JWT string
 *
 * @throws
 * This exception is thrown if the tokenSecret is invalid
 */
function createTemporaryToken(email: string, formID: string, tokenSecret: string): string {
  if (tokenSecret?.length > 0) {
    return jwt.sign(
      {
        email,
        formID,
      },
      tokenSecret,
      { expiresIn: "7d" }
    );
  } else {
    throw new Error("Could not create temporary token: Invalid token secret.");
  }
}

/**
 * Save a temporary token to the form_users table in the database for a specific user and form
 * @param temporaryToken
 * @param email
 * @param templateId
 * @returns the query result
 */
async function updateTemporaryToken(temporaryToken: string, email: string, templateId: string) {
  try {
    // Throws an error is user is not found
    const user = await prisma.apiUser.findUnique({
      where: {
        templateId_email: {
          email: email,
          templateId: templateId,
        },
      },
      select: {
        email: true,
        templateId: true,
        active: true,
      },
    });
    if (user?.active) {
      await prisma.apiUser.update({
        where: {
          templateId_email: {
            email: user.email,
            templateId: user.templateId,
          },
        },
        data: {
          temporaryToken: temporaryToken,
        },
      });
    } else {
      throw new Error("User is not found or not active");
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      throw new Error("User is not found or not active");
    }
    throw e;
  }
}

async function sendTemporaryTokenByEmail(email: string, temporaryToken: string) {
  const sendTempTokenTemplateID = process.env.TEMPORARY_TOKEN_TEMPLATE_ID;
  const notifyClient = getNotifyInstance();

  // Here is the documentation for the `sendEmail` function: https://docs.notifications.service.gov.uk/node.html#send-an-email
  return notifyClient
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
}

function buildUserLockedOutErrorMessage(
  remainingNumberOfAttemptsBeforeLockout?: number,
  numberOfSecondsBeforeLockoutExpires?: number
) {
  return {
    error: "User is not allowed to request temporary token",
    remainingNumberOfAttemptsBeforeLockout,
    numberOfSecondsBeforeLockoutExpires,
  };
}

/**
 * API outcomes:
 * 200: `success` if everything goes well
 * 400: `Invalid payload` if no email in request payload
 * 401: `User is not allowed to request temporary token` if email and/or form access token is not valid. Response paylaod also optionally contains `remainingNumberOfAttemptsBeforeLockout` (if user can still try to log in) and `numberOfSecondsBeforeLockoutExpires` (if user is locked out)
 * 500: `Internal error` if something goes wrong while sending temporary token ; or ; `Server cannot respond at this time` if TOKEN_SECRET environment variable is not defined
 */

// Removing access for all Methods until this API is ready for use.
export default middleware([cors({ allowedMethods: [] })], handler);

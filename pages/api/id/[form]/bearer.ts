import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { logMessage } from "@lib/logger";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { cors, sessionExists, middleware } from "@lib/middleware";
import { MiddlewareProps, WithRequired, UserAbility } from "@lib/types";
import { createAbility, checkPrivileges, AccessControlError } from "@lib/privileges";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  props: MiddlewareProps
): Promise<void> => {
  const { session } = props as WithRequired<MiddlewareProps, "session">;
  try {
    const formID = req.query.form;
    if (Array.isArray(formID) || !formID)
      return res
        .status(400)
        .json({ error: "form ID parameter was not provided in the resource path" });

    if (!session) return res.status(401).json({ error: "Unauthorized" });
    const ability = createAbility(session);

    switch (req.method) {
      case "GET":
        return await getToken(ability, formID, res);
      case "POST":
        return await createToken(ability, formID, res);

      default:
        return res.status(500).json({ error: "Method not supported" });
    }
  } catch (e) {
    if (e instanceof AccessControlError) return res.status(403).json({ error: "Forbidden" });
    logMessage.error(e as Error);
    return res.status(500).json({ error: "Internal Service Error" });
  }
};

/**
 * This function when called will create or refresh a token for a specific form
 * If the form is not found it will return a 404 response. Otherwise a 200 status
 * code will be returned
 * @param req The request object containing data of the request
 * @param res The response object containing all that is needed to return a response
 */
export async function createToken(
  ability: UserAbility,
  formID: string,
  res: NextApiResponse
): Promise<void> {
  // Verify if use can update the bearer token on this form
  const targetFormRecord = await prisma.template
    .findUnique({
      where: {
        id: formID,
      },
      select: {
        users: {
          select: {
            id: true,
          },
        },
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (targetFormRecord === null) return res.status(404).json({ error: "Form Not Found" });
  checkPrivileges(ability, [
    { action: "update", subject: { type: "FormRecord", object: targetFormRecord } },
  ]);

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
  const updatedBearerToken = await prisma.template
    .update({
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
    })
    .catch((e) => prismaErrors(e, null));

  return res.status(200).json(updatedBearerToken);
}

/**
 * Gets a bearer token associated with a form.
 * @param ability Users Ability Instance
 * @param formID Id of the form being referenced
 * @param res Next JS response instance
 * @returns Bearer Token if it exists
 */
export async function getToken(
  ability: UserAbility,
  formID: string,
  res: NextApiResponse
): Promise<void> {
  //Fetching the token returns the bearer token or null.

  const result = await prisma.template
    .findUnique({
      where: {
        id: formID,
      },
      select: {
        bearerToken: true,
        users: {
          select: {
            id: true,
          },
        },
      },
    })
    .catch((e) => prismaErrors(e, null));
  if (result === null) return res.status(404).json({ error: "Not Found" });
  // To save a database call we retrieve the bearer token but additionally return the users.
  checkPrivileges(ability, [{ action: "view", subject: { type: "FormRecord", object: result } }]);

  return res.status(200).json({ bearerToken: result.bearerToken });
}

// Removing access for all Methods until this API is ready for use.
export default middleware([cors({ allowedMethods: [] }), sessionExists()], handler);

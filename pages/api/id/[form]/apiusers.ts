import { middleware, cors, sessionExists } from "@lib/middleware";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { Prisma } from "@prisma/client";
import { isValidGovEmail } from "@lib/validation";
import { Session } from "next-auth";
import { logActivity, AdminLogAction, AdminLogEvent } from "@lib/auditLogs";
import { MiddlewareProps, WithRequired, UserAbility } from "@lib/types";
import { createAbility, AccessControlError } from "@lib/privileges";
import { checkPrivileges } from "@lib/privileges";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  props: MiddlewareProps
): Promise<void> => {
  const { session } = props as WithRequired<MiddlewareProps, "session">;
  try {
    const ability = createAbility(session);
    switch (req.method) {
      case "GET":
        return await getEmailListByFormID(ability, req, res);
      case "PUT":
        return await activateOrDeactivateFormOwners(ability, req, res, session);
      case "POST":
        return await addEmailToForm(ability, req, res, session);
      default:
        return res.status(400).json({ error: "Bad Request" });
    }
  } catch (err) {
    if (err instanceof AccessControlError) return res.status(403).json({ error: "Forbidden" });
    res.status(500).json({ error: "Error on Server Side" });
  }
};

export async function getEmailListByFormID(
  ability: UserAbility,
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const formID = req.query.form;
  if (Array.isArray(formID) || !formID)
    return res.status(400).json({ error: "Malformed API Request FormID not define" });

  if (formID) {
    const emailList = await prisma.template
      .findUnique({
        where: {
          id: formID,
        },
        select: {
          apiUsers: {
            select: {
              id: true,
              email: true,
              active: true,
            },
          },
          users: {
            select: {
              id: true,
            },
          },
        },
      })
      .catch((e) => prismaErrors(e, null));

    // The prisma response will be null if the form is not found

    if (!emailList) return res.status(404).json({ error: "Form Not Found" });

    checkPrivileges(ability, [
      { action: "view", subject: { type: "FormRecord", object: emailList } },
    ]);

    //Return all emails associated with formID
    if (emailList) return res.status(200).json(emailList.apiUsers);
  }
}
/**
 * It will activate and deactivate all the owners associated to a specific form.
 * This function is expecting to find a payload in the request body like:
 * { "email": "forms@cds.ca", "active":"0/1"}
 * "email": The email of the user associated to the form
 * "active": Boolean value indicating whether the form owner is active or not
 * @param req
 * @param res
 */
export async function activateOrDeactivateFormOwners(
  ability: UserAbility,
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void> {
  try {
    //Extracting req body
    const { email, active } = req.body || {};
    //Payload validation fix: true case scenario
    if (!email || typeof active !== "boolean") {
      //Invalid payload
      return res.status(400).json({ error: "Invalid payload fields are not define" });
    }

    const formID = req.query.form;
    if (Array.isArray(formID) || !formID)
      return res.status(400).json({ error: "Malformed API Request FormID not define" });

    // check if user is an owner on the form
    const template = await prisma.template.findUnique({
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
    });

    if (!template) return res.status(404).json({ error: "Form Not Found" });
    checkPrivileges(ability, [
      { action: "update", subject: { type: "FormRecord", object: template } },
    ]);

    //Update form_users's records
    const updatedRecord = await prisma.apiUser.update({
      where: {
        templateId_email: {
          templateId: formID,
          email: email,
        },
      },
      data: {
        active: active,
      },
      select: {
        id: true,
        active: true,
      },
    });

    if (session && session.user.id) {
      await logActivity(
        session.user.id,
        AdminLogAction.Update,
        active ? AdminLogEvent.GrantFormAccess : AdminLogEvent.RevokeFormAccess,
        `Access to form id: ${formID} has been ${
          active ? "granted" : "revoked"
        } for email: ${email}`
      );
    }

    //A record was updated and returns the id { "id": 1, active: false } etc.
    return res.status(200).json(updatedRecord);
  } catch (e) {
    //A 404 status code for a form Not Found in form_users
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      // Error P2025: Record to update not found.
      return res.status(404).json({ error: "Email Not Found" });
    }
    if (e instanceof AccessControlError) return res.status(403).json({ error: "Forbidden" });
    return res.status(500).json({ error: "Could not process request" });
  }
}
/**
 * This method aims to create a unique binding between a form template and a user
 * who needs to access the form's data later on. Here are some requirements that must be satisfied
 * in order to associate users to collect a form's data
 * Rule 1: a valid government email address
 * Rule 2: the FromID/template must exist
 * Rule 3: the email must not be already associated to the template
 * @param req The request object
 * @param res The response object
 */
export async function addEmailToForm(
  ability: UserAbility,
  req: NextApiRequest,
  res: NextApiResponse,
  session?: Session
): Promise<void> {
  //Checking the payload's content
  const { email } = req.body;
  if (!isValidGovEmail(email)) {
    return res.status(400).json({ error: "The email is not a valid GC email" });
  }
  const formID = req.query.form;
  if (Array.isArray(formID) || !formID)
    return res.status(400).json({ error: "Malformed API Request FormID not define" });

  try {
    // check if user is an owner on the form
    const template = await prisma.template.findUnique({
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
    });

    if (!template) return res.status(404).json({ error: "Form Not Found" });
    checkPrivileges(ability, [
      { action: "update", subject: { type: "FormRecord", object: template } },
    ]);

    // Will throw an error if the user and templateID unique id already exist
    const formUserID = await prisma.apiUser.create({
      data: {
        templateId: formID,
        email: email,
      },
      select: {
        id: true,
      },
    });

    if (session && session.user.id) {
      await logActivity(
        session.user.id,
        AdminLogAction.Create,
        AdminLogEvent.GrantInitialFormAccess,
        `Email: ${email} has been given access to form id: ${formID}`
      );
    }

    return res.status(200).json({ success: formUserID });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      // Unique constraint failed
      return res
        .status(400)
        .json({ error: "The formID does not exist or User is already assigned" });
    } else {
      throw error;
    }
  }
}
export default middleware(
  [cors({ allowedMethods: ["GET", "POST", "PUT"] }), sessionExists()],
  handler
);

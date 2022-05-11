import { middleware, cors, sessionExists } from "@lib/middleware";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@lib/integration/prismaConnector";
import { Prisma } from "@prisma/client";
import { isValidGovEmail } from "@lib/validation";
import emailDomainList from "../../../../email.domains.json";
import { AdminLogAction, AdminLogEvent, MiddlewareProps } from "@lib/types";
import { Session } from "next-auth";
import { logAdminActivity } from "@lib/adminLogs";
import { logMessage } from "@lib/logger";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  { session }: MiddlewareProps
): Promise<void> => {
  try {
    switch (req.method) {
      case "GET":
        return await getEmailListByFormID(req, res);
      case "PUT":
        return await activateOrDeactivateFormOwners(req, res, session);
      case "POST":
        return await addEmailToForm(req, res, session);
      default:
        return res.status(400).json({ error: "Bad Request" });
    }
  } catch (err) {
    res.status(500).json({ error: "Error on Server Side" });
  }
};

export async function getEmailListByFormID(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const formID = req.query.form as string;
  if (formID) {
    try {
      //Get emails by formID
      const emailList = await prisma.formUser.findMany({
        where: {
          templateId: formID,
        },
        select: {
          id: true,
          email: true,
          active: true,
        },
      });

      //Return all emails associated with formID
      if (emailList) return res.status(200).json(emailList);

      // If emailList is undefined it's because an underlying Prisma error was thrown
      throw new Error("Prisma Engine Error");
    } catch (e) {
      // For production tracabiltiy
      logMessage.info(e as Error);
      //Otherwise a 404 form Not Found
      return res.status(404).json({ error: "Form Not Found" });
    }
  }
  //Could not find formID in the path
  return res.status(400).json({ error: "Malformed API Request FormID not define" });
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
  req: NextApiRequest,
  res: NextApiResponse,
  session?: Session
): Promise<void> {
  try {
    //Extracting req body
    const requestBody = req.body ? req.body : undefined;
    //Payload validation fix: true case scenario
    if (!requestBody?.email || typeof requestBody.active !== "boolean") {
      //Invalid payload
      return res.status(400).json({ error: "Invalid payload fields are not define" });
    }
    const { email, active } = requestBody;
    const formID = req.query.form as string;
    if (!formID) return res.status(400).json({ error: "Malformed API Request Invalid formID" });
    //Update form_users's records
    const updatedRecord = await prisma.formUser.update({
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
      await logAdminActivity(
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
      return res.status(404).json({ error: "Form or email Not Found" });
    }
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
  req: NextApiRequest,
  res: NextApiResponse,
  session?: Session
): Promise<void> {
  //Get request body
  const requestBody = req.body ? req.body : undefined;
  //Checkimg the payload's content

  const email = requestBody.email;
  if (!email || !isValidGovEmail(email, emailDomainList.domains)) {
    return res.status(400).json({ error: "The email is not a valid GC email" });
  }
  const formID = req.query.form as string;
  if (!formID) return res.status(400).json({ error: "Malformed API Request Invalid formID" });
  try {
    // Will throw an error if the user and templateID unique id already exist
    const formUserID = await prisma.formUser.create({
      data: {
        templateId: formID,
        email: email,
      },
      select: {
        id: true,
      },
    });

    if (session && session.user.id) {
      await logAdminActivity(
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

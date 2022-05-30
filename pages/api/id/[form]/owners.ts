import { middleware, cors, sessionExists } from "@lib/middleware";
import { NextApiRequest, NextApiResponse } from "next";
import dbConnector from "@lib/integration/dbConnector";

import executeQuery from "@lib/integration/queryManager";
import { isValidGovEmail } from "@lib/validation";
import emailDomainList from "../../../../email.domains.json";
import { Session } from "next-auth";
import { logAdminActivity } from "@lib/adminLogs";
import { MiddlewareProps } from "@lib/types";
import { AdminLogAction, AdminLogEvent } from "@lib/types/utility-types";

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
    //Get emails by formID
    const resultObject = await executeQuery(
      await dbConnector(),
      "SELECT id, email, active FROM form_users WHERE template_id = ($1)",
      [formID]
    );
    //Return all emails associated with formID
    if (resultObject.rowCount > 0) return res.status(200).json(resultObject.rows);
    //Otherwise a 404 form Not Found
    return res.status(404).json({ error: "Form Not Found" });
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
  const resultObject = await executeQuery(
    await dbConnector(),
    "UPDATE form_users SET active=($1) WHERE template_id = ($2) AND email = ($3) RETURNING id",
    [active, formID, email as string]
  );

  if (session && session.user.id) {
    await logAdminActivity(
      session.user.id,
      AdminLogAction.Update,
      active ? AdminLogEvent.GrantFormAccess : AdminLogEvent.RevokeFormAccess,
      `Access to form id: ${formID} has been ${active ? "granted" : "revoked"} for email: ${email}`
    );
  }

  //A record was updated and return ids [ { "id": 1 } etc.. ]
  if (resultObject.rowCount > 0) return res.status(200).json(resultObject.rows);
  //A 404 status code for a form Not Found in form_users
  return res.status(404).json({ error: "Form or email Not Found" });
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
  if (!requestBody?.email || !isValidGovEmail(requestBody.email, emailDomainList.domains)) {
    return res.status(400).json({ error: "The email is not a valid GC email" });
  }
  const formID = req.query.form as string;
  const email = requestBody.email as string;
  if (!formID) return res.status(400).json({ error: "Malformed API Request Invalid formID" });
  try {
    const result = await executeQuery(
      await dbConnector(),
      "INSERT INTO form_users (template_id, email) VALUES ($1, $2) RETURNING id",
      [formID, email]
    );

    if (session && session.user.id) {
      await logAdminActivity(
        session.user.id,
        AdminLogAction.Create,
        AdminLogEvent.GrantInitialFormAccess,
        `Email: ${email} has been given access to form id: ${formID}`
      );
    }

    return res.status(200).json({ success: result.rows[0] });
  } catch (error) {
    const message = (error as Error).message;
    //formID foreign key violation
    if (message.includes("violates foreign key constraint")) {
      return res.status(404).json({ error: "The formID does not exist" });
      //violating email and template_id uniqueness
    } else if (message.includes("violates unique constraint")) {
      return res.status(400).json({ error: "This email is already binded to this form" });
    }
  }
}
export default middleware(
  [cors({ allowedMethods: ["GET", "POST", "PUT"] }), sessionExists()],
  handler
);

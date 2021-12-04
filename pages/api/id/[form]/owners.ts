import isRequestAllowed from "../../../../lib/middleware/httpRequestAllowed";
import { NextApiRequest, NextApiResponse } from "next";
import dbConnector from "../../../../lib/integration/dbConnector";
import isUserSessionExist from "../../../../lib/middleware/HttpSessionExist";
import executeQuery from "../../../../lib/integration/queryManager";
import { isValidGovEmail } from "@lib/tsUtils";
import emailDomainList from "@lib/email.domains.json";

const owners = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  try {
    switch (req.method) {
      case "GET":
        return await getEmailListByFormID(req, res);
      case "PUT":
        return await activateOrDeactivateFormOwners(req, res);
      case "POST":
        return await addEmailToForm(req, res);
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
  res: NextApiResponse
): Promise<void> {
  //Extracting req body
  const requestBody = req.body ? JSON.parse(req.body) : undefined;
  //Payload validation
  if (!requestBody?.email || !requestBody?.active || typeof requestBody.active !== "boolean") {
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
export async function addEmailToForm(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  //Get request body
  const requestBody = req.body ? JSON.parse(req.body) : undefined;
  //Checkimg the payload's content
  if (!requestBody?.email || !isValidGovEmail(requestBody.email, emailDomainList.domains)) {
    return res.status(400).json({ error: "The email is not a valid GC email" });
  }
  const formID = req.query.form as string;
  if (!formID) return res.status(400).json({ error: "Malformed API Request Invalid formID" });
  //Checking if formID exists in db return true or false
  //May return true if it exists otherwise false
  const isFormIDExistResult = await executeQuery(
    await dbConnector(),
    "SELECT exists(SELECT 1 FROM templates WHERE id = ($1))",
    [formID]
  );
  type ARowExists = { exists?: boolean };
  const { exists } = isFormIDExistResult.rows[0] as ARowExists;
  if (!exists) return res.status(404).json({ error: "FormID does not exist" });

  const { email } = requestBody;
  //May return true if the email is associated otherwise false
  const emailTieToFormResult = await executeQuery(
    await dbConnector(),
    "SELECT exists(SELECT 1 FROM form_users WHERE template_id = ($1) AND email = ($2))",
    [formID, email as string]
  );
  const isEmailTieToForm = emailTieToFormResult.rows[0] as ARowExists;
  //The template is not linked to the email
  if (!isEmailTieToForm.exists) {
    const result = await executeQuery(
      await dbConnector(),
      "INSERT INTO form_users (template_id, email) VALUES ($1, $2) RETURNING id",
      [formID, email as string]
    );
    return res.status(200).json({ success: result.rows[0] });
  } else {
    return res
      .status(400)
      .json({ error: "This email was already associeted with the same form ID" });
  }
}
export default isRequestAllowed(["GET", "POST", "PUT"], isUserSessionExist(owners));

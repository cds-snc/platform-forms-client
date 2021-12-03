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
    res.status(500).json({ error: `Error on Server Side` });
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
      dbConnector(),
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
  const { email, active } = requestBody; // TODO email should be checked i.e (valid Gov email). See #491
  const formID = req.query.form as string;
  if (!formID) return res.status(400).json({ error: "Malformed API Request Invalid formID" });
  //Update form_users's records
  const resultObject = await executeQuery(
    dbConnector(),
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
* who can access the data later on. Here are some requirements that must be satisfied
* in order to associate users to collect a form's data
* Rule 1: A valid GC email domain
* Rule 2: From ID must exist
* Rule 3: An email has to be unique to a template
 * @param req
 * @param res
 * @returns
 */
export async function addEmailToForm(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  //Get request body
  const requestBody = req.body ? JSON.parse(req.body) : undefined;
  //Valid payload
  if (!requestBody?.email || !isValidGovEmail(requestBody.email, emailDomainList.domains)) {
    return res.status(400).json({ error: "Invalid email in payload" });
  }

  const formID = req.query.form as string;
  //FormID must be defined
  if (!formID) return res.status(400).json({ error: "Malformed API Request Invalid formID" });
  //Checking if formID exists in db return true or false
  const isFormIDExistResult = await executeQuery(
    dbConnector(),
    "SELECT exists(SELECT 1 FROM form_users WHERE template_id = ($1))",
    [formID]
  );
  if (!isFormIDExistResult) return res.status(404).json({ error: "FormID does not exist" });

  const { email } = requestBody;
  //Checking if the email hasn't been associated before to this template
  const countResult = await executeQuery(
    dbConnector(),
    "SELECT count (*) FROM form_users WHERE template_id = ($1) AND email = ($2)",
    [formID, email as string]
  );
  type Count = {
    count?: string;
  };
  const { count } = countResult.rows[0] as Count;
  let result;
  switch (count) {
    case "0":
      //Creating an association link record template <-> email(data's owner)
      result = await executeQuery(
        dbConnector(),
        "INSERT INTO form_users (template_id, email) VALUES ($1, $2) RETURNING id",
        [formID, email as string]
      );
      return res.status(200).json({ success: result.rows[0] });
    case "1":
      //This email is already binded to the current template
      return res
        .status(400)
        .json({ error: "This email was already associeted with the same form ID" });
    default:
      //Not allowed
      return res
        .status(400)
        .json({ error: "This email is not unique for to the specified template" });
  }
}
export default isRequestAllowed(["GET", "POST", "PUT"], isUserSessionExist(owners));

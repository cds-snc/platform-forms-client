import isRequestAllowed from "../../../../lib/middleware/httpRequestAllowed";
import { NextApiRequest, NextApiResponse } from "next";
import dbConnector from "../../../../lib/integration/dbConnector";
import isUserSessionExist from "../../../../lib/middleware/HttpSessionExist";
import executeQuery from "../../../../lib/integration/queryManager";

const owners = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  try {
    switch (req.method) {
      case "GET":
        return await getEmailListByFormID(req, res);
      case "PUT":
        return await activateOrDeactivateFormOwners(req, res);
      case "POST":
        // TODO handle card #491 to associate a specific email to a form
        break;
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
  const requestBody =
    req.body && Object.keys(req.body).length > 0 ? JSON.parse(req.body) : undefined;
  //Payload validation
  if (!requestBody?.email || !requestBody?.active) {
    //Invalid payload
    return res.status(400).json({ error: "Invalid payload fields are not define" });
  }

  const formID = req.query.form as string;
  const { email, active } = requestBody;
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
export default isRequestAllowed(["GET", "POST", "PUT"], isUserSessionExist(owners));



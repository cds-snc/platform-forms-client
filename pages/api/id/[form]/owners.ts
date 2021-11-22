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
      default:
        res.status(200); // TODO handle card # 491 to associate a specific an email to the form
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
    //Get emails by form ID
    const resultObject = await executeQuery(
      dbConnector(),
      "SELECT email FROM form_users WHERE template_id = ($1)",
      [formID]
    );
    type EmailListResponse = { email: string };
    //Return all emails associated with formID
    if (resultObject.rowCount > 0)
      return res.status(200).json(
        resultObject.rows.map((elem) => {
          const { email } = elem as unknown as EmailListResponse;
          return email;
        })
      );
    //Otherwise a 404 form Not Found
    return res.status(404).json({ error: "Form Not Found" });
  }
  //Could not find formID in the path
  return res.status(400).json({ error: "Malformed API Request" });
}

export default isRequestAllowed(["GET", "POST"], isUserSessionExist(owners));

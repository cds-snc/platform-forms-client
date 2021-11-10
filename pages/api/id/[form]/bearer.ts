import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import { TemplateDbHelper } from "../../../../lib/helpers/TemplateDbHelper";

const retrieve = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getSession({ req });
    // Only allow a valid user session
    if (!session || session === null || req.method !== "GET")
      return res.status(403).json({ error: "Access Denied" });
    //Getting form id form request
    const formID = req.query.id;
    if (formID) {
      //Fetching the token
      const token = await TemplateDbHelper.findTokenByFormID(formID);
      // return the token if it exists
      if (token) res.status(200).json({ token: token });
      // otherwise an error
      res.status(400).json({ error: "Malformed API Request" });
    }
    res.status(400).json({ error: "Malformed API Request" });
  } catch (err) {
    res.status(500).json({ error: "Error on Server Side" });
  }
};
export default retrieve;

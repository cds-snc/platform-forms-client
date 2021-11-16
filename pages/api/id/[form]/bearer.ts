import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import queryManager from "../../../../lib/integration/queryManager";
import isRequestAllowed from "../../../../lib/middleware/httpRequestAllowed";

const allowedMethods = ["GET"];

export const retrieve = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  try {
    const session = await getSession({ req });
    // Only allow a valid user session
    if (!session || session === null || req.method !== "GET")
      return res.status(403).json({ error: "Access Denied" });
    await getToken(res, req.query.form as string);
  } catch (err) {
    res.status(500).json({ error: `Error on Server Side ${err}` });
  }
};
/**
 * Will return a bearer token if there is one associated with a given formID
 * It might return a Not found (404) if token doest exist ( undefined or null)
 * otherwise 400 as status code.
 * @param formID A form id
 */
async function getToken(res: NextApiResponse, formID: string) {
  type BearerResponse = {
    bearer_token: string;
  };
  if (formID) {
    //Fetching the token return list of object or an empty array
    const data = queryManager.getResult(
      await queryManager.executeQuery("SELECT bearer_token FROM templates WHERE id = ($1)", [
        formID,
      ])
    );
    if (data && data.length > 0) {
      const { bearer_token } = data[0] as unknown as BearerResponse;
      return res.status(200).json({ token: bearer_token });
    }
    // otherwise the resource was not found
    return res.status(404).json({ error: "Not Found" });
  }
  res.status(400).json({ error: "Malformed API Request" });
}
export default isRequestAllowed(allowedMethods, retrieve);

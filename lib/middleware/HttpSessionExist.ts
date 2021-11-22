import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";

const isUserSessionExist = (handler: (req: NextApiRequest, res: NextApiResponse) => void) => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<unknown> => {
    const session = await getSession({ req });
    if (session) return handler(req, res);
    res.status(403).json({ error: "Access Denied" });
  };
};
export default isUserSessionExist;

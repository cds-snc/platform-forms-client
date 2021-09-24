import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";

const isRequestAllowed = (
  methods: string[],
  handler: (req: NextApiRequest, res: NextApiResponse) => void
) => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<unknown> => {
    try {
      const session = await getSession({ req });
      const requestBody = JSON.parse(req.body);
      const forbidden = res.status(403).json({ error: "Forbidden" });
      if (requestBody.method && methods.includes(requestBody.method)) {
        switch (requestBody.method) {
          case "GET":
            return handler(req, res);
          case "INSERT":
          case "UPDATE":
          case "DELETE":
            return session ? handler(req, res) : forbidden;
          default:
            return forbidden;
        }
      } else {
        return forbidden;
      }
    } catch {
      res.status(500).json({ error: "Malformed API Request" });
    }
  };
};

export default isRequestAllowed;

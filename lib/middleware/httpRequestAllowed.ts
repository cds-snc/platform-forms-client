import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";

const isRequestAllowed = (
  methods: string[],
  handler: (req: NextApiRequest, res: NextApiResponse) => void
) => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<unknown> => {
    try {
      const session = await getSession({ req });
      const requestBody =
        req.body && Object.keys(req.body).length > 0 ? JSON.parse(req.body) : undefined;
      const method = requestBody?.method ? requestBody.method : req.method;
      if (methods.includes(method)) {
        switch (method) {
          case "GET":
            return handler(req, res);
          default:
            if (session) {
              return handler(req, res);
            } else {
              res.status(403).json({ error: "Forbidden" });
            }
            break;
        }
      } else {
        res.status(403).json({ error: "Forbidden" });
      }
    } catch {
      res.status(500).json({ error: "Malformed API Request" });
    }
  };
};

export default isRequestAllowed;

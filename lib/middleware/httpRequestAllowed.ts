import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";

const isRequestAllowed = (
  methods: string[],
  handler: (req: NextApiRequest, res: NextApiResponse) => void
) => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<unknown> => {
    try {
      const session = await getSession({ req });
      let method;
      let isAllow = false;
      if (req.body) {
        //TODO Should use the HTTP standard API to determine HTTP's verbs.Keeping this section for backward compatibility.
        const requestBody = JSON.parse(req.body);
        isAllow = requestBody.method && methods.includes(requestBody.method);
        method = requestBody.method;
      } else {
        method = req.method;
        isAllow = methods.includes(req.method ?? "");
      }
      if (isAllow) {
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

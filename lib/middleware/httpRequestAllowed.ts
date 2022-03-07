import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";

const isRequestAllowed = (
  methods: string[],
  handler: (req: NextApiRequest, res: NextApiResponse) => void
) => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<unknown> => {
    try {
      const session = await getSession({ req });
      const method = req.method;
      // If method is undefined throw an Error. Function is not implemented properly
      if (!method) throw new Error("Function must be called from an instance of http.server");
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

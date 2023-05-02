import { AccessControlError, createAbility } from "@lib/privileges";
import { middleware, cors, sessionExists } from "@lib/middleware";
import type { NextApiRequest, NextApiResponse } from "next";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { numberOfUnprocessedSubmissions } from "@lib/vault";

const getNumberOfUnprocessedSubmissions = async (
  req: NextApiRequest,
  res: NextApiResponse,
  props: MiddlewareProps
) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;

    const formId = req.query.form;

    if (!formId || typeof formId !== "string") {
      return res.status(400).json({ error: "Bad request" });
    }

    const result = await numberOfUnprocessedSubmissions(createAbility(session), formId);

    return res.status(200).json({ numberOfUnprocessedSubmissions: result });
  } catch (err) {
    if (err instanceof AccessControlError) return res.status(403).json({ error: "Forbidden" });
    else return res.status(500).json({ error: "There was an error. Please try again later." });
  }
};

export default middleware(
  [cors({ allowedMethods: ["GET"] }), sessionExists()],
  getNumberOfUnprocessedSubmissions
);

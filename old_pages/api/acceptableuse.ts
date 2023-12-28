import { NextApiRequest, NextApiResponse } from "next";
import { cors, middleware, csrfProtected, sessionExists } from "@lib/middleware";
import { setAcceptableUse } from "@lib/cache/acceptableUseCache";
import { MiddlewareProps, WithRequired } from "@lib/types";

const acceptableUse = async (
  _req: NextApiRequest,
  res: NextApiResponse,
  props: MiddlewareProps
) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;
    await setAcceptableUse(session.user.id);
    res.status(200).json({});
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export default middleware(
  [cors({ allowedMethods: ["POST"] }), csrfProtected(["POST"]), sessionExists()],
  acceptableUse
);

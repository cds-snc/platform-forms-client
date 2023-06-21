import { AccessControlError, createAbility } from "@lib/privileges";
import { middleware, cors, sessionExists } from "@lib/middleware";
import type { NextApiRequest, NextApiResponse } from "next";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { getUser } from "@lib/users";
import { getAllTemplatesForUser } from "@lib/templates";

const getPublishedForms = async (
  req: NextApiRequest,
  res: NextApiResponse,
  props: MiddlewareProps
) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;
    const ability = createAbility(session);

    const accountId = req.query.id as string;
    const user = await getUser(accountId, ability);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const templates = await getAllTemplatesForUser(ability, accountId, true);

    // const result = await numberOfUnprocessedSubmissions(createAbility(session), formId);

    return res.status(200).json(templates);
  } catch (err) {
    if (err instanceof AccessControlError) return res.status(403).json({ error: "Forbidden" });
    else return res.status(500).json({ error: "There was an error. Please try again later." });
  }
};

export default middleware([cors({ allowedMethods: ["GET"] }), sessionExists()], getPublishedForms);

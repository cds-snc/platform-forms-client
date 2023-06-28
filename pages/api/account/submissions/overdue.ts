import { AccessControlError, createAbility } from "@lib/privileges";
import { middleware, cors, sessionExists } from "@lib/middleware";
import type { NextApiRequest, NextApiResponse } from "next";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { getUnprocessedSubmissionsForUser } from "@lib/users";

const getUnprocessedEntries = async (
  req: NextApiRequest,
  res: NextApiResponse,
  props: MiddlewareProps
) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;
    const ability = createAbility(session);

    // Get user
    const user = session.user;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const overdue = await getUnprocessedSubmissionsForUser(ability, user.id);

    Object.entries(overdue).forEach(([, value]) => {
      if (value.level > 2) {
        return res.status(200).json({ hasOverdueSubmissions: true });
      }
    });

    return res.status(200).json({ hasOverdueSubmissions: false });
  } catch (err) {
    if (err instanceof AccessControlError) return res.status(403).json({ error: "Forbidden" });
    else return res.status(500).json({ error: "There was an error. Please try again later." });
  }
};

export default middleware(
  [cors({ allowedMethods: ["GET"] }), sessionExists()],
  getUnprocessedEntries
);

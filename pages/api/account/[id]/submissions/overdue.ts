import { AccessControlError, createAbility } from "@lib/privileges";
import { middleware, cors, sessionExists } from "@lib/middleware";
import type { NextApiRequest, NextApiResponse } from "next";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { getUser } from "@lib/users";
import { getAllTemplatesForUser } from "@lib/templates";
import { listAllSubmissions } from "@lib/vault";
import { detectOldUnprocessedSubmissions } from "@lib/nagware";

const getUnprocessedEntries = async (
  req: NextApiRequest,
  res: NextApiResponse,
  props: MiddlewareProps
) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;
    const ability = createAbility(session);

    // Get user
    const accountId = req.query.id as string;
    const user = await getUser(accountId, ability);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get published templates for User
    const templates = await getAllTemplatesForUser(ability, user.id, true);

    const templateIds = templates.map((template) => template.id);

    const result = await Promise.all(
      templateIds.map(async (templateId) => {
        const allSubmissions = await listAllSubmissions(ability, templateId);

        const unprocessed = await detectOldUnprocessedSubmissions(allSubmissions.submissions);

        if (unprocessed.level > 2) {
          return true;
        }
        return false;
      })
    );

    return res.status(200).json({ hasOverdueSubmissions: result.some((r) => r === true) });
  } catch (err) {
    if (err instanceof AccessControlError) return res.status(403).json({ error: "Forbidden" });
    else return res.status(500).json({ error: "There was an error. Please try again later." });
  }
};

export default middleware(
  [cors({ allowedMethods: ["GET"] }), sessionExists()],
  getUnprocessedEntries
);

import { NextApiRequest, NextApiResponse } from "next";
import { cors, middleware, sessionExists } from "@lib/middleware";
import { logMessage } from "@lib/logger";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { createTicket } from "@lib/integration/freshdesk";

const requestPublishingPermission = async (
  req: NextApiRequest,
  res: NextApiResponse,
  props: MiddlewareProps
) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;

    const { managerEmail, department, goals, language } = req.body;

    if (!managerEmail || !department || !goals) {
      return res.status(404).json({ error: "Malformed request" });
    }

    const description = `
${session.user.name} (${session.user.email}) from ${department} has requested permission to publish forms.<br/>
<br/>
Goals:<br/>
${goals}<br/>
<br/>
Manager email address: ${managerEmail} .<br/><br/>
****<br/><br/>
${session.user.name} (${session.user.email}) du ${department} a demandé l'autorisation de publier des formulaires.<br/>
<br/>
Objectifs:<br/>
${goals}<br/>
<br/>
Adresse email du responsable: ${managerEmail} .<br/>
`;

    if (!session.user.name || !session.user.email) {
      throw new Error("User name or email not found");
    }

    const result = await createTicket({
      type: "publishing",
      name: session.user.name,
      email: session.user.email,
      description,
      language: language,
    });

    if (result && result?.status >= 400) {
      throw new Error(`Freshdesk error: ${result.status} ${result.statusText}`);
    }

    return res.status(200).json({});
  } catch (error) {
    logMessage.error(error);
    return res.status(500).json({ error: "Failed to send request" });
  }
};

export default middleware(
  [cors({ allowedMethods: ["POST"] }), sessionExists()],
  requestPublishingPermission
);

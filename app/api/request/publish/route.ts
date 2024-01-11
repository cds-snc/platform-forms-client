import { middleware, sessionExists } from "@lib/middleware";
import { logMessage } from "@lib/logger";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { createTicket } from "@lib/integration/freshdesk";
import { NextResponse } from "next/server";

interface APIProps {
  managerEmail?: string;
  department?: string;
  goals?: string;
  language?: string;
}

export const POST = middleware([sessionExists()], async (req, props) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;

    const { managerEmail, department, goals, language = "en" }: APIProps = props.body;

    if (!managerEmail || !department || !goals) {
      NextResponse.json({ error: "Malformed request" }, { status: 400 });
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
      throw new Error(`Freshdesk error: ${result.status}`);
    }
    return NextResponse.json({});
  } catch (error) {
    logMessage.error(error);
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
  }
});

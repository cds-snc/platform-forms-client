"use server";
import { auth } from "@lib/auth";
import { createTicket } from "@lib/integration/freshdesk";
import { logMessage } from "@lib/logger";

export async function unlockPublishing({
  managerEmail,
  department,
  goals,
  language = "en",
}: {
  managerEmail?: string;
  department?: string;
  goals?: string;
  language?: string;
}) {
  const session = await auth();
  if (!session) throw new Error("No session");

  //Mandatory fields
  if (!managerEmail || !department || !goals) {
    throw new Error("Malformed request");
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

  try {
    const result = await createTicket({
      type: "publishing",
      name: session.user.name,
      email: session.user.email,
      description,
      language: language,
    });

    if (result?.status >= 400) {
      throw new Error(
        `Freshdesk error: ${JSON.stringify(result)} - ${session.user.email} - ${description}`
      );
    }

    return { status: 200 };
  } catch (error) {
    logMessage.error(error);
    throw new Error("Failed to send request");
  }
}

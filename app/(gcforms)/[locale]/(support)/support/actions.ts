"use server";
import { createTicket } from "@lib/integration/freshdesk";
import { logMessage } from "@lib/logger";

interface Submission {
  name?: string;
  email?: string;
  request?: string;
  description?: string;
  language?: string;
}

export async function support({ name, email, request, description, language = "en" }: Submission) {
  // No auth etc. checking since this is a public endpoint

  //Mandatory fields
  if (!name || !email || !request || !description) {
    throw new Error("Malformed request");
  }

  // Request may be a list of strings (checkbox), format it a bit if so, or just a string (radio)
  const requestParsed =
    request.toString().split(",").length > 1
      ? request
          .toString()
          .split(",")
          .map((item: string) => `-${item}`)
          .join("\n")
      : request;

  const emailBody = `
${name} (${email}) has requested support for the form-builder.<br/>
<br/>
Support request:<br/>
${requestParsed}<br/>
<br/>
Additional details:<br/>
${description}<br/>
<br/>
****<br/>
${name} (${email}) a demandé de soutien des form-builder.<br/>
<br/>
Demande de soutien:<br/>
${requestParsed}<br/>
<br/>
Détails supplémentaires:<br/>
${description}<br/>
`;

  try {
    const result = await createTicket({
      type: "problem",
      name,
      email,
      description: emailBody,
      language,
    });

    if (result?.status >= 400) {
      throw new Error(`Freshdesk error: ${JSON.stringify(result)} - ${email} - ${emailBody}`);
    }
    return result;
  } catch (error) {
    logMessage.error(error);
    throw new Error("Internal Service Error: Failed to send request");
  }
}

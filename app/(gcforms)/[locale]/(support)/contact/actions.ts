"use server";
import { createTicket } from "@lib/integration/freshdesk";
import { logMessage } from "@lib/logger";

export async function contact({
  name,
  email,
  request,
  description,
  department,
  branch,
  jobTitle,
  language = "en",
}: {
  name: string;
  email: string;
  request: string;
  description: string;
  department?: string;
  branch?: string;
  jobTitle?: string;
  language?: string;
}) {
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
${name} (${email}) has requested we contact them for the form-builder.<br/>
<br/>
Department or agency:<br/>
${department}<br/>

Branch or sector:<br/>
${branch}<br/>
<br/>
Job title:<br/>
${jobTitle}<br/>
<br/>
Contact request:<br/>
${requestParsed}<br/>
<br/>
Additional details:<br/>
${description}<br/>
<br/>
****
${name} (${email}) a demandé que nous les contactions pour le générateur de formulaires..<br/>
<br/>
Ministère ou organisme:<br/>
${department}<br/>
<br/>
Direction ou secteur:<br/>
${branch}<br/>
<br/>
Titre de poste:<br/>
${jobTitle}<br/>
<br/>
Demande de contact soutien:<br/>
${requestParsed}<br/>
<br/>
Détails supplémentaires:<br/>
${description}<br/>
`;

  try {
    const result = await createTicket({
      type: "contact",
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

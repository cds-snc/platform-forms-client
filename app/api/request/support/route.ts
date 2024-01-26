import { NextResponse } from "next/server";
import { middleware, csrfProtected } from "@lib/middleware";
import { logMessage } from "@lib/logger";
import { createTicket } from "@lib/integration/freshdesk";

interface APIProps {
  supportType?: string;
  name?: string;
  email?: string;
  request?: string;
  description?: string;
  department?: string;
  branch?: string;
  jobTitle?: string;
  language?: string;
}

// Allows an authenticated or unauthenticated user to send an email requesting help

export const POST = middleware([csrfProtected()], async (req, props) => {
  const {
    supportType,
    name,
    email,
    request,
    description,
    department,
    branch,
    jobTitle,
    language = "en",
  }: APIProps = props.body;

  //Mandatory fields
  if (
    !supportType ||
    !["contactus", "support"].includes(supportType) ||
    !name ||
    !email ||
    !request ||
    !description
  ) {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });
  }

  // Additional field required for contact us
  if (supportType === "contactus" && !department) {
    NextResponse.json({ error: "Malformed request" }, { status: 400 });
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

  let emailBody = "";
  if (supportType === "contactus") {
    emailBody = `
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
  } else {
    emailBody = `
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
  }

  const parsedSupportType = supportType === "contactus" ? "contact" : "problem";

  try {
    const result = await createTicket({
      type: parsedSupportType,
      name,
      email,
      description: emailBody,
      language,
    });

    if (result?.status >= 400) {
      throw new Error(`Freshdesk error: ${JSON.stringify(result)} - ${email} - ${emailBody}`);
    }
    return NextResponse.json(result);
  } catch (error) {
    logMessage.error(error);
    return NextResponse.json(
      { error: "Internal Service Error: Failed to send request" },
      { status: 500 }
    );
  }
});

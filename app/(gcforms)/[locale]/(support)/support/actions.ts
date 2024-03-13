"use server";
import { createTicket } from "@lib/integration/freshdesk";
import { logMessage } from "@lib/logger";
import { redirect } from "next/navigation";
import { email, minLength, object, parse, string, ValiError } from "valibot";

// TODO translation strings
const SupportSchema = object({
  name: string("Name required", [minLength(1, "Name too short")]),
  email: string("Email required", [
    minLength(1, "Please enter your email."),
    email("The email address is badly formatted."),
  ]),
  request: string("Complete the required field to continue.", [
    minLength(1, "Complete the required field to continue."),
  ]),
  description: string("Description required", [minLength(1, "Please enter a description.")]),
});

export async function support({
  formData,
  language = "en",
}: {
  formData: FormData;
  language?: string;
}) {
  try {
    // Validate the form data and throw an error if it's invalid
    const name = String(formData.get("name") || "");
    const email = String(formData.get("email") || "");
    const request = String(formData.get("request") || "");
    const description = String(formData.get("description") || "");
    parse(SupportSchema, { name, email, request, description });

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
      redirect(`/${language}/support?success`);
    } catch (error) {
      logMessage.error(error);
      throw new Error("Internal Service Error: Failed to send request");
    }
  } catch (e) {
    if (e instanceof ValiError) {
      const { issues } = e;
      const errors = issues.reduce((accumulator, issue) => {
        if (!issue.path) {
          return accumulator;
        }
        const fieldName = String(issue.path[0].key);
        const message = issue.message;
        const error = { [fieldName]: message };
        return { ...accumulator, ...error };
      }, {});
      return { errors };
    }

    logMessage.error(e);
    throw e;
  }
}

import axios, { AxiosResponse } from "axios";
import { logMessage } from "@lib/logger";
import { getOrigin } from "@lib/origin";

interface createTicketProps {
  type: "branding" | "publishing" | "contact" | "problem";
  name: string;
  email: string;
  description: string;
  language: string;
  host?: string;
}

export const formatTicketData = ({
  type,
  name,
  email,
  description,
  language,
  host = "",
}: createTicketProps) => {
  const hostTag = tagHost(host);

  const ticket = {
    branding: {
      subject: "Submit a new branding option / Proposer une nouvelle option d’image de marque",
      type: "Branding Request",
      tags: [hostTag, "Forms_Request_Logo"],
    },
    publishing: {
      subject: "Publishing permission request / Demande d’autorisation de publication",
      type: "Go Live Request",
      tags: [hostTag, "Forms_Request_GoLive"],
    },
    contact: {
      subject: "Question from GC Forms Portal / Question du portail Formulaires GC",
      type: "Question",
      tags: [hostTag],
    },
    problem: {
      subject: "Problem with GC Forms / Problème avec Formulaires GC",
      type: "Problem",
      tags: [hostTag],
    },
  };

  const parsedLanguage = language === "fr" ? "Français" : "English";

  const data = {
    name: name,
    email: email,
    type: ticket[type].type,
    subject: ticket[type].subject,
    tags: ticket[type].tags,
    description: description,
    custom_fields: {
      cf_language: parsedLanguage,
    },
    source: 2,
    priority: 1,
    status: 2,
    product_id: 61000000642,
    group_id: 61000172262,
  };

  return data;
};

export const tagHost = (host: string) => {
  if (host.includes("staging") || process.env.REVIEW_ENV) {
    return "Forms_Staging";
  } else if (host.includes("localhost") || host === "") {
    return "Forms_Dev";
  } else {
    return "Forms_Production";
  }
};

export const createTicket = async ({
  type,
  name,
  email,
  description,
  language,
}: createTicketProps) => {
  if (process.env.APP_ENV === "test") {
    logMessage.info("Not sending to FreshDesk, application in Test mode");
    return { status: 200 } as AxiosResponse;
  }

  const username = process.env.FRESHDESK_API_KEY;
  const password = "X";
  const HOST = await getOrigin();
  const data = formatTicketData({ type, name, email, description, language, host: HOST });

  if (!username) throw new Error("Freshdesk API key not found");

  return axios({
    url: "https://cds-snc.freshdesk.com/api/v2/tickets",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(username + ":" + password).toString("base64"),
    },

    data: JSON.stringify(data),
    // If no connection can be made with Freskdesk within 5 seconds, abort the call.
    signal: AbortSignal.timeout(5000),
    // If Freskdesk accepts the connection but does not respond within 5 seconds, abort the call.
    timeout: 5000,
  }).catch((error) => {
    if (error.response) {
      // The remote server responded with an error mesasge
      logMessage.error(
        `Bad http response from FreshDesk: ${error.response.status} - ${JSON.stringify(
          error.response.data
        )} - ${email} - ${JSON.stringify(data)}`
      );
    } else if (axios.isCancel(error)) {
      // No response was received from FreshDesk
      logMessage.error(`Call to FreshDesk timed out. Could not submit: ${JSON.stringify(data)}`);
    } else {
      // Unknown Error
      logMessage.error(`Could not connect to FreshDesk: ${error.message}`);
    }
    // Error back to client.
    throw new Error("Could not connect to Freshdesk");
  });
};

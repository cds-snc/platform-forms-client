import fetch from "node-fetch";
import { logMessage } from "@lib/logger";
import { getOrigin } from "@lib/origin";

interface createTicketProps {
  type: "branding" | "publishing" | "contact" | "problem";
  name: string;
  email: string;
  description: string;
  language: string;
}

export const formatTicketData = ({
  type,
  name,
  email,
  description,
  language,
}: createTicketProps) => {
  const HOST = getOrigin() || "";
  const hostTag = tagHost(HOST);

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
  if (host.includes("staging")) {
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
    logMessage.info("Not sending to Fresh Desk, application in Test mode");
    return { status: 200 };
  }

  const username = process.env.FRESHDESK_API_KEY;
  const password = "X";
  const data = formatTicketData({ type, name, email, description, language });

  if (!username) throw new Error("Freshdesk API key not found");

  const response = await fetch("https://cds-snc.freshdesk.com/api/v2/tickets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + btoa(username + ":" + password),
    },
    body: JSON.stringify(data),
  });

  if (response?.ok === false) {
    logMessage.error(`Bad http response: ${response.status} - ${email} - ${JSON.stringify(data)}`);

    const errorDetail = await response.text();
    throw new Error(`Freshdesk error with response: ${errorDetail}`);
  }

  return response;
};

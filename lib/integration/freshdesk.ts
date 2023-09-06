import fetch from "node-fetch";
import { logMessage } from "@lib/logger";

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
  const HOST = process.env.NEXTAUTH_URL || "";
  const hostTag = tagHost(HOST);

  const ticket = {
    branding: {
      subject: "Submit a new branding option for XYZ",
      type: "Branding Request",
      tags: [hostTag, "Forms_Request_Logo"],
    },
    publishing: {
      subject: "Publishing permission request for XYZ",
      type: "Go Live Request",
      tags: [hostTag, "Forms_Request_GoLive"],
    },
    contact: {
      subject: "Question from GC Forms Portal",
      type: "Question",
      tags: [hostTag],
    },
    problem: {
      subject: "Problem with GC Forms",
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
  if (process.env.NODE_ENV !== "production") return;

  try {
    const username = process.env.FRESHDESK_API_KEY;
    const password = "X";
    const data = formatTicketData({ type, name, email, description, language });
    const result = await fetch("https://cds-snc.freshdesk.com/api/v2/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(username + ":" + password),
      },
      body: JSON.stringify(data),
    });

    return result;
  } catch (error) {
    logMessage.error("create ticket failed:" + error);
  }
};

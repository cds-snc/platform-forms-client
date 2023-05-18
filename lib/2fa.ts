import { NotifyClient } from "notifications-node-client";
import { logMessage } from "@lib/logger";
import crypto from "crypto";
const TEMPLATE_ID = process.env.TEMPLATE_ID;
const NOTIFY_API_KEY = process.env.NOTIFY_API_KEY;

export const generateVerificationCode = async () => {
  // Temporary - for testing purposes
  // Will create more robust code generation in the future
  return crypto.randomBytes(5).toString("hex");
};

export const sendVerificationCode = async (email: string, verificationCode: string) => {
  try {
    // attempt to send the code to the user through Notify
    // setup the notify client
    const notify = new NotifyClient("https://api.notification.canada.ca", NOTIFY_API_KEY);

    await notify.sendEmail(TEMPLATE_ID, email, {
      personalisation: {
        subject: "Your verification code | Votre code de vérification",
        formResponse: `
**Your verification code | Votre code de vérification**
- ${verificationCode}`,
      },
    });
  } catch (err) {
    logMessage.error(
      `{"status": "failed", "message": "Notify Failed To Send the Code", "error":${
        (err as Error).message
      }}`
    );
    throw new Error("Notify failed to send the code");
  }
};

import { NotifyClient } from "notifications-node-client";
import { logMessage } from "@lib/logger";
import { generateTokenCode } from "@lib/auth/tokenGenerator";

const TEMPLATE_ID = process.env.TEMPLATE_ID;
const NOTIFY_API_KEY = process.env.NOTIFY_API_KEY;

export const generateVerificationCode = async () => await generateTokenCode(5);

export const sendVerificationCode = async (email: string, verificationCode: string) => {
  try {
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

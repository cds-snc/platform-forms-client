import { sendEmail } from "@lib/integration/notifyConnector";

import { generateTokenCode } from "@lib/auth/tokenGenerator";
import { logMessage } from "@lib/logger";

export const generateVerificationCode = async () => generateTokenCode(5);

export const sendVerificationCode = async (email: string, verificationCode: string) => {
  try {
    await sendEmail(email, {
      subject: "Your security code | Votre code de sécurité",
      formResponse: `
      **Your security code | Votre code de sécurité**
      \n\n
      ${verificationCode}`,
    });
  } catch (err) {
    logMessage.error(
      `Failed to send verification code email to ${email}. Reason: ${(err as Error).message}.`
    );
    throw err;
  }
};

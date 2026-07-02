import { sendDefaultEmail } from "@lib/integration/notifyConnector";
import { generateTokenCode } from "@lib/auth/tokenGenerator";
import { logMessage } from "@lib/logger";

export const generateVerificationCode = async () => generateTokenCode(5);

export const sendVerificationCode = async (email: string, verificationCode: string) => {
  try {
    await sendDefaultEmail({
      to: [email],
      subject: "Your security code | Votre code de sécurité",
      body: `
**Your security code | Votre code de sécurité**



${verificationCode}`,
      options: { bypassNotificationPipeline: true }, // The notification pipeline uses DynamoDB to temporarily store email content but we don't want this 2FA code to be stored anywhere
    });
  } catch (err) {
    logMessage.error(
      `Failed to send verification code email to ${email}. Reason: ${(err as Error).message}.`
    );
    throw err;
  }
};

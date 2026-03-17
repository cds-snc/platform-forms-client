import { sendEmail } from "@lib/integration/notifyConnector";

import { generateTokenCode } from "@lib/auth/tokenGenerator";

export const generateVerificationCode = async () => generateTokenCode(5);

export const sendVerificationCode = async (email: string, verificationCode: string) => {
  try {
    await sendEmail(
      email,
      {
        subject: "Your security code | Votre code de sécurité",
        formResponse: `
**Your security code | Votre code de sécurité**



${verificationCode}`,
      },
      "2faVerificationCode"
    );
  } catch (err) {
    throw err;
  }
};

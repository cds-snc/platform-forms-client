import { prisma } from "@lib/integration/prismaConnector";
import { generateVerificationCode } from "./2fa";
import { logMessage } from "@lib/logger";
import { sanitizeEmailAddressForCognito } from "./cognito";
import { getNotifyInstance } from "@lib/integration/notifyConnector";

export const sendPasswordResetLink = async (email: string): Promise<void> => {
  const sanitizedEmail = sanitizeEmailAddressForCognito(email);

  const doesUserExist = await prisma.user.findUnique({
    where: {
      email: sanitizedEmail,
    },
  });

  if (doesUserExist === null) throw new Error("UserDoesNotExist");

  const generatedToken = await generateVerificationCode();

  const dateIn15Minutes = new Date(Date.now() + 900000); // 15 minutes (= 900000 ms)

  try {
    await prisma.magicLink.upsert({
      where: {
        identifier: sanitizedEmail,
      },
      update: {
        token: generatedToken,
        expires: dateIn15Minutes,
      },
      create: {
        identifier: sanitizedEmail,
        token: generatedToken,
        expires: dateIn15Minutes,
      },
    });

    await sendPasswordResetEmail(sanitizedEmail, generatedToken);
  } catch (error) {
    throw new Error(`Failed to send password reset link. Reason: ${(error as Error).message}.`);
  }
};

export const getPasswordResetAuthenticatedUserEmailAddress = async (
  token: string
): Promise<string> => {
  try {
    const deleteMagicLinkEntry = async (identifier: string) => {
      await prisma.magicLink.deleteMany({
        where: {
          identifier,
          token,
        },
      });
    };

    const magicLink = await prisma.magicLink.findUnique({
      where: {
        token: token,
      },
    });

    if (magicLink === null) throw new Error("Invalid password reset link");

    if (magicLink.expires.getTime() < new Date().getTime()) {
      await deleteMagicLinkEntry(magicLink.identifier);
      throw new Error("Password reset link has expired");
    }

    await deleteMagicLinkEntry(magicLink.identifier);

    return magicLink.identifier;
  } catch (error) {
    throw new Error(`Failed to retrieve user email address. Reason: ${(error as Error).message}.`);
  }
};

const sendPasswordResetEmail = async (email: string, token: string) => {
  try {
    const notify = getNotifyInstance();

    const baseUrl = `http://${process.env.APP_DOMAIN}`;

    await notify.sendEmail(process.env.TEMPLATE_ID, email, {
      personalisation: {
        subject: "Password reset | Réinitialisation de mot de passe",
        formResponse: `
Reset your password with this link:

[${baseUrl}/en/auth/resetpassword?token=${token}](${baseUrl}/en/auth/resetpassword?token=${token})
****
Réinitialisez votre mot de passe avec ce lien :

[${baseUrl}/fr/auth/resetpassword?token=${token}](${baseUrl}/fr/auth/resetpassword?token=${token})`,
      },
    });
  } catch (err) {
    logMessage.error(
      `{"status": "failed", "message": "Notify failed to send the password reset email", "error":${
        (err as Error).message
      }}`
    );
    throw new Error("Notify failed to send the password reset email");
  }
};

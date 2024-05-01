import { prisma } from "@lib/integration/prismaConnector";
import { generateVerificationCode } from "./2fa";
import { logMessage } from "@lib/logger";
import { getNotifyInstance } from "@lib/integration/notifyConnector";
import { userHasSecurityQuestions } from "@lib/auth/securityQuestions";
import { getOrigin } from "@lib/origin";

export class PasswordResetInvalidLink extends Error {}
export class PasswordResetExpiredLink extends Error {}

export const deleteMagicLinkEntry = async (identifier: string) => {
  await prisma.magicLink.deleteMany({
    where: {
      identifier,
    },
  });
};

export const sendPasswordResetLink = async (email: string): Promise<void> => {
  const doesUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (doesUserExist === null) {
    logMessage.warn(
      `Someone requested a reset password link with an email address that does not exist (${email})`
    );
    return;
  }

  const generatedToken = await generateVerificationCode();

  const dateIn15Minutes = new Date(Date.now() + 900000); // 15 minutes (= 900000 ms)

  try {
    const doesUserHaveSecurityQuestions = await userHasSecurityQuestions({ email });

    if (!doesUserHaveSecurityQuestions)
      throw new Error(`Missing security questions for user ${email}`);

    await prisma.magicLink.upsert({
      where: {
        identifier: email,
      },
      update: {
        token: generatedToken,
        expires: dateIn15Minutes,
      },
      create: {
        identifier: email,
        token: generatedToken,
        expires: dateIn15Minutes,
      },
    });

    await sendPasswordResetEmail(email, generatedToken);
  } catch (error) {
    throw new Error(`Failed to send password reset link. Reason: ${(error as Error).message}.`);
  }
};

export const getPasswordResetAuthenticatedUserEmailAddress = async (
  token: string
): Promise<string> => {
  const magicLink = await prisma.magicLink.findUnique({
    where: {
      token: token,
    },
  });

  if (magicLink === null) throw new PasswordResetInvalidLink();

  if (magicLink.expires.getTime() < new Date().getTime()) {
    await deleteMagicLinkEntry(magicLink.identifier);
    throw new PasswordResetExpiredLink();
  }

  return magicLink.identifier;
};

const sendPasswordResetEmail = async (email: string, token: string) => {
  try {
    const notify = getNotifyInstance();

    const baseUrl = getOrigin();

    await notify.sendEmail(process.env.TEMPLATE_ID, email, {
      personalisation: {
        subject: "Password reset | Réinitialisation de mot de passe",
        formResponse: `
Reset your password with this link:

[${baseUrl}/en/auth/reset-password/${token}](${baseUrl}/en/auth/reset-password/${token})
****
Réinitialisez votre mot de passe avec ce lien :

[${baseUrl}/fr/auth/reset-password/${token}](${baseUrl}/fr/auth/reset-password/${token})`,
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

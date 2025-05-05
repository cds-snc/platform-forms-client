import { prisma } from "@lib/integration/prismaConnector";
import { generateVerificationCode } from "./2fa";
import { logMessage } from "@lib/logger";
import { sendEmail } from "@lib/integration/notifyConnector";
import { userHasSecurityQuestions } from "@lib/auth/securityQuestions";
import { getOrigin } from "@lib/origin";

export class PasswordResetInvalidLink extends Error {
  constructor(message?: string) {
    super(message ?? "PasswordResetInvalidLink");
    Object.setPrototypeOf(this, PasswordResetInvalidLink.prototype);
  }
}
export class PasswordResetExpiredLink extends Error {
  constructor(message?: string) {
    super(message ?? "PasswordResetExpiredLink");
    Object.setPrototypeOf(this, PasswordResetExpiredLink.prototype);
  }
}

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
  const baseUrl = await getOrigin();

  await sendEmail(
    email,
    {
      subject: "Password reset | Réinitialisation de mot de passe",
      formResponse: `
Reset your password with this link:

[${baseUrl}/en/auth/reset-password/${token}](${baseUrl}/en/auth/reset-password/${token})
****
Réinitialisez votre mot de passe avec ce lien :

[${baseUrl}/fr/auth/reset-password/${token}](${baseUrl}/fr/auth/reset-password/${token})`,
    },
    "passwordReset"
  );
};

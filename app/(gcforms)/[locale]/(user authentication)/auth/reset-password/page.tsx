import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import {
  PasswordResetExpiredLink,
  PasswordResetInvalidLink,
  getPasswordResetAuthenticatedUserEmailAddress,
  retrieveUserSecurityQuestions,
} from "@lib/auth";
import { redirect } from "next/navigation";
import { CheckEmail, CannotReset, ExpiredLink, InvalidLink } from "./components/server";
import { revalidatePath } from "next/cache";
import { InitiateResetForm, QuestionChallengeForm } from "./components/client";
import { logMessage } from "@lib/logger";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("reset-password", { lang: locale });
  return {
    title: t("resetPassword.title"),
  };
}

export default async function Page({
  params: { locale },
  searchParams: { token },
}: {
  params: { locale: string };
  searchParams: { token?: string };
}) {
  logMessage.debug("Running server component of page");
  // Ensure this path is always revalidated
  revalidatePath("(gcforms)/[locale]/(user authentication)/auth/reset-password", "page");

  if (token) {
    try {
      const email = await getPasswordResetAuthenticatedUserEmailAddress(token);

      const userSecurityQuestions = await retrieveUserSecurityQuestions({ email });

      if (userSecurityQuestions.length === 0) {
        return <CannotReset {...{ locale }} />;
      }

      return <QuestionChallengeForm email={email} userSecurityQuestions={userSecurityQuestions} />;
    } catch (e) {
      if (e instanceof PasswordResetExpiredLink) {
        return <ExpiredLink {...{ locale }} />;
      }

      if (e instanceof PasswordResetInvalidLink) {
        return <InvalidLink {...{ locale }} />;
      }

      redirect(`/$locale/auth/login`);
    }
  } else {
    return (
      <InitiateResetForm
        confirmationPage={<CheckEmail locale={locale} />}
        errorPage={<CannotReset locale={locale} />}
      />
    );
  }
}

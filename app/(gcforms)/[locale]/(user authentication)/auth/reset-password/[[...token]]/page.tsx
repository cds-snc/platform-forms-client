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
import { InitiateResetForm, QuestionChallengeForm } from "./components/client";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("reset-password", { lang: locale });
  return {
    title: t("resetPassword.title"),
  };
}

export default async function Page(props: {
  params: Promise<{ locale: string; token?: string[] }>;
}) {
  const params = await props.params;

  const { locale, token } = params;

  if (token && token[0]) {
    try {
      const email = await getPasswordResetAuthenticatedUserEmailAddress(token[0]);

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
      <div id="auth-panel">
        <InitiateResetForm
          confirmationPage={<CheckEmail locale={locale} />}
          errorPage={<CannotReset locale={locale} />}
        />
      </div>
    );
  }
}

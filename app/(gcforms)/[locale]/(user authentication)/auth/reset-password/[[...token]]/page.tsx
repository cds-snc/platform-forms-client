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
    let email: string | null = null;
    let userSecurityQuestions: Awaited<ReturnType<typeof retrieveUserSecurityQuestions>> = [];
    let errorType: "expired" | "invalid" | "redirect" | null = null;

    try {
      email = await getPasswordResetAuthenticatedUserEmailAddress(token[0]);
      userSecurityQuestions = await retrieveUserSecurityQuestions({ email });
    } catch (e) {
      if (e instanceof PasswordResetExpiredLink) {
        errorType = "expired";
      } else if (e instanceof PasswordResetInvalidLink) {
        errorType = "invalid";
      } else {
        errorType = "redirect";
      }
    }

    if (errorType === "expired") {
      return <ExpiredLink {...{ locale }} />;
    }

    if (errorType === "invalid") {
      return <InvalidLink {...{ locale }} />;
    }

    if (errorType === "redirect") {
      redirect(`/${locale}/auth/login`);
    }

    if (userSecurityQuestions.length === 0) {
      return <CannotReset {...{ locale }} />;
    }

    return <QuestionChallengeForm email={email!} userSecurityQuestions={userSecurityQuestions} />;
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

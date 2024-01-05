import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { ResetPassword } from "./clientSide";
import UserNavLayout from "@clientComponents/globals/layouts/UserNavLayout";
import {
  PasswordResetExpiredLink,
  PasswordResetInvalidLink,
  SecurityQuestion,
  getPasswordResetAuthenticatedUserEmailAddress,
  retrieveUserSecurityQuestions,
} from "@lib/auth";
import { redirect } from "next/navigation";

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
  let userSecurityQuestions: SecurityQuestion[] = [];
  let email = "";

  if (token) {
    try {
      email = await getPasswordResetAuthenticatedUserEmailAddress(token);
      userSecurityQuestions = await retrieveUserSecurityQuestions({ email });

      if (userSecurityQuestions.length === 0) {
        redirect(`/${locale}/auth/reset-failed`);
      }
    } catch (e) {
      if (e instanceof PasswordResetExpiredLink) {
        redirect(`/${locale}/auth/expired-link`);
      }

      if (e instanceof PasswordResetInvalidLink) {
        redirect(`/${locale}/auth/invalid-link`);
      }
      redirect(`/$locale/auth/login`);
    }
  }

  return (
    <UserNavLayout contentWidth="tablet:w-[658px]">
      <ResetPassword {...{ email, userSecurityQuestions }} />
    </UserNavLayout>
  );
}

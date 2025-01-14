import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { retrievePoolOfSecurityQuestions, retrieveUserSecurityQuestions } from "@lib/auth";
import { Profile } from "./components/server/Profile";
import { authCheckAndRedirect } from "@lib/actions";
import { authorization } from "@lib/privileges";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("profile", { lang: locale });
  return {
    title: t("title"),
  };
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;

  const { locale } = params;

  const { session, ability } = await authCheckAndRedirect();

  const userCanPublish = await authorization.hasPermissionToPublishForms();

  const [userQuestions, allQuestions] = await Promise.all([
    retrieveUserSecurityQuestions({ userId: ability.user.id }),
    retrievePoolOfSecurityQuestions(),
  ]);

  return (
    <Profile
      locale={locale}
      email={session.user.email}
      {...{ publishingStatus: userCanPublish, userQuestions, allQuestions }}
    />
  );
}

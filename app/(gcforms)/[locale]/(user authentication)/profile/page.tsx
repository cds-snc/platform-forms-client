import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { retrievePoolOfSecurityQuestions, retrieveUserSecurityQuestions } from "@lib/auth";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { Profile } from "./components/server/Profile";
import { authCheckAndRedirect } from "@lib/actions";

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

  const hasPublishPrivilege = checkPrivilegesAsBoolean(ability, [
    {
      action: "update",
      subject: { type: "FormRecord", object: { users: [{ id: session.user.id }] } },
      field: "isPublished",
    },
  ]);

  const [userQuestions, allQuestions] = await Promise.all([
    retrieveUserSecurityQuestions({ userId: ability.userID }),
    retrievePoolOfSecurityQuestions(),
  ]);

  return (
    <Profile
      locale={locale}
      email={session.user.email}
      {...{ publishingStatus: hasPublishPrivilege, userQuestions, allQuestions }}
    />
  );
}

import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { retrievePoolOfSecurityQuestions, retrieveUserSecurityQuestions } from "@lib/auth";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { Profile } from "./components/server/Profile";
import { authCheckAndRedirect } from "@lib/actions";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("profile", { lang: locale });
  return {
    title: t("title"),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const { session, ability } = await authCheckAndRedirect();

  const hasPublishPrivilege = checkPrivilegesAsBoolean(ability, [
    { action: "update", subject: "FormRecord", field: "isPublished" },
  ]);

  const [userQuestions, allQuestions] = await Promise.all([
    retrieveUserSecurityQuestions(ability, { userId: ability.userID }),
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

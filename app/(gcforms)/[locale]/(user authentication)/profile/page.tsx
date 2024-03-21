import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { auth, retrievePoolOfSecurityQuestions, retrieveUserSecurityQuestions } from "@lib/auth";
import { createAbility } from "@lib/privileges";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { Profile } from "./components/server/Profile";
import { redirect } from "next/navigation";

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
  const session = await auth();
  if (!session) redirect(`/${locale}/auth/login`);

  const ability = createAbility(session);

  const hasPublishPrivilege = checkPrivilegesAsBoolean(ability, [
    { action: "update", subject: "FormRecord", field: "isPublished" },
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

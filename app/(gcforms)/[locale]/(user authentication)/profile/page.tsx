import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import {
  requireAuthentication,
  retrievePoolOfSecurityQuestions,
  retrieveUserSecurityQuestions,
} from "@lib/auth";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { FullWidthLayout } from "@clientComponents/globals/layouts";
import { Profile } from "./clientSide";

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
  const { user } = await requireAuthentication();
  checkPrivilegesAsBoolean(user.ability, [{ action: "view", subject: "FormRecord" }], {
    redirect: true,
  });

  const publishingStatus = checkPrivilegesAsBoolean(user.ability, [
    { action: "update", subject: "FormRecord", field: "isPublished" },
  ]);

  const [userQuestions, allQuestions] = await Promise.all([
    retrieveUserSecurityQuestions({ userId: user.ability.userID }),
    retrievePoolOfSecurityQuestions(),
  ]);

  return (
    <FullWidthLayout context="default">
      <Profile email={user.email} {...{ publishingStatus, userQuestions, allQuestions }} />
    </FullWidthLayout>
  );
}

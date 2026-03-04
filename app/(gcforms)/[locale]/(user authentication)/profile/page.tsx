import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { Profile } from "./oidc/components/server/Profile";
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

  const { session } = await authCheckAndRedirect();

  const userCanPublish = await authorization.hasPublishFormsPrivilege();

  return (
    <Profile
      locale={locale}
      email={session.user.email}
      givenName={session.user.profile?.givenName}
      familyName={session.user.profile?.familyName}
      accountUrl={session.user.accountUrl}
      publishingStatus={userCanPublish}
    />
  );
}

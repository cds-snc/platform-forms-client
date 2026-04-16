import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { OidcProfile } from "./components/server/OidcProfile";
import { authCheckAndRedirect } from "@lib/actions";
import { authorization } from "@lib/privileges";
import { redirect } from "next/navigation";

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

/*
Profile page for OIDC flow
*/
export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;

  const { locale } = params;

  const { session } = await authCheckAndRedirect();

  // Redirect if someone lands on this page and isn't an OIDC session
  if (!session.user.accountUrl) {
    redirect(`/${locale}/profile`);
  }

  const userCanPublish = await authorization.hasPublishFormsPrivilege();

  return (
    <OidcProfile
      locale={locale}
      email={session.user.email}
      givenName={session.user.profile?.givenName}
      familyName={session.user.profile?.familyName}
      accountUrl={session.user.accountUrl}
      publishingStatus={userCanPublish}
    />
  );
}

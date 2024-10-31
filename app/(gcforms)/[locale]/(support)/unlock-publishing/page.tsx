import { serverTranslation } from "@i18n";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { Metadata } from "next";
import { RedirectType, redirect } from "next/navigation";
import { UnlockPublishingForm } from "./components/client/UnlockPublishingForm";
import { authCheckAndRedirect } from "@lib/actions";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("unlock-publishing", { lang: locale });
  return {
    title: t("unlockPublishing.title"),
  };
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const { locale } = params;

  const { ability, session } = await authCheckAndRedirect();

  if (
    checkPrivilegesAsBoolean(ability, [
      {
        action: "update",
        subject: { type: "FormRecord", object: { users: [{ id: session.user.id }] } },
        field: "isPublished",
      },
    ])
  ) {
    redirect(`/${locale}/forms`, RedirectType.replace);
  }

  return <UnlockPublishingForm userEmail={session.user.email} />;
}

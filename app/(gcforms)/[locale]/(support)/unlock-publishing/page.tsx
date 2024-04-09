import { serverTranslation } from "@i18n";
import { auth } from "@lib/auth";
import { checkPrivilegesAsBoolean, createAbility } from "@lib/privileges";
import { Metadata } from "next";
import { RedirectType, redirect } from "next/navigation";
import { Success } from "./components/server/Success";
import { UnlockPublishingForm } from "./components/client/UnlockPublishingForm";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("unlock-publishing", { lang: locale });
  return {
    title: t("unlockPublishing.title"),
  };
}

export default async function Page({
  params: { locale },
  searchParams: { success },
}: {
  params: { locale: string };
  searchParams: { success?: string };
}) {
  const session = await auth();
  if (!session) return null;
  const ability = createAbility(session);

  if (
    checkPrivilegesAsBoolean(ability, [
      { action: "update", subject: "FormRecord", field: "isPublished" },
    ])
  ) {
    redirect(`/${locale}/forms`, RedirectType.replace);
  }

  return (
    <>
      {success === undefined ? (
        <UnlockPublishingForm userEmail={session.user.email} />
      ) : (
        <Success />
      )}
    </>
  );
}

import { serverTranslation } from "@i18n";
import { requireAuthentication } from "@lib/auth";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { Metadata } from "next";
import { UnlockPublishing } from "./clientSide";
import DefaultLayout from "@clientComponents/globals/layouts/DefaultLayout";

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string[] };
}): Promise<Metadata> {
  const { t } = await serverTranslation("unlock-publishing", { lang: locale });
  const [requested] = slug ?? [];
  return {
    title: requested ? t("unlockPublishingSubmitted.title") : t("unlockPublishing.title"),
  };
}

export default async function Page({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string[] };
}) {
  const { user } = await requireAuthentication();

  if (
    checkPrivilegesAsBoolean(user.ability, [
      { action: "update", subject: "FormRecord", field: "isPublished" },
    ])
  ) {
    return {
      redirect: {
        destination: `/${locale}/forms`,
        permanent: false,
      },
    };
  }

  const [requested] = slug ?? [];

  return (
    <DefaultLayout showLanguageToggle={true}>
      <UnlockPublishing requested={requested === "requested"} />
    </DefaultLayout>
  );
}

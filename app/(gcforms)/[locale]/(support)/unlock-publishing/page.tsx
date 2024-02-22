import { serverTranslation } from "@i18n";
import { requireAuthentication } from "@lib/auth";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { Metadata } from "next";
import { UnlockPublishing } from "./UnlockPublishing";

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

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
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

  return <UnlockPublishing />;
}

import { serverTranslation } from "@i18n";
import { Published } from "@clientComponents/form-builder/app";
import { auth } from "@lib/auth";
import { createAbility } from "@lib/privileges";

import { Metadata } from "next";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("gcFormsPublished")} — ${t("gcForms")}`,
  };
}

export default async function Page({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const session = await auth();

  if (!session) {
    return null;
  }

  try {
    const ability = createAbility(session);
    const canView = ability?.can("view", "FormRecord");
    return <Published id={id} locale={locale} canView={canView} />;
  } catch (e) {
    return null;
  }
}

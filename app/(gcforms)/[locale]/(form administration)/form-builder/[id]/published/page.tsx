import { serverTranslation } from "@i18n";
import { auth } from "@lib/auth";
import { createAbility } from "@lib/privileges";
import { getFullTemplateByID } from "@lib/templates";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Published } from "./Published";

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

  const ability = createAbility(session);

  const initialForm = await getFullTemplateByID(ability, id);

  if (!initialForm?.isPublished) {
    return notFound();
  }

  try {
    const canView = ability?.can("view", "FormRecord");
    return <Published id={id} locale={locale} canView={canView} />;
  } catch (e) {
    return null;
  }
}

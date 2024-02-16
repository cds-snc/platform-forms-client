import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { Publish } from "@clientComponents/form-builder/app";
import { auth } from "@lib/auth";
import { LoggedOutTab, LoggedOutTabName } from "@serverComponents/form-builder/LoggedOutTab";
import { createAbility } from "@lib/privileges";
import { getFullTemplateByID } from "@lib/templates";
import { redirect } from "next/navigation";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("gcFormsPublish")} — ${t("gcForms")}`,
  };
}

export default async function Page({
  params: { id, locale },
}: {
  params: { id: string; locale: string };
}) {
  const session = await auth();
  const ability = session && createAbility(session);

  // @TODO: should be able to pull this from the Provider?
  const initialForm = ability && (await getFullTemplateByID(ability, id));

  if (initialForm?.isPublished) {
    redirect(`/${locale}/form-builder/${id}/published`);
  }

  if (!session) {
    return <LoggedOutTab tabName={LoggedOutTabName.PUBLISH} />;
  }

  return <Publish />;
}

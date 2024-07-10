import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { ApiKey } from "./components/client/ApiKey";
import { authCheckAndRedirect } from "@lib/actions";
import { checkKeyExists } from "./actions";
import { checkOne } from "@lib/cache/flags";
import { redirect } from "next/navigation";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("gcFormsSettings")} — ${t("gcForms")}`,
  };
}

export default async function Page({
  params: { id, locale },
}: {
  params: { id: string; locale: string };
}) {
  await authCheckAndRedirect();
  const flag = await checkOne("zitadelAuth");
  if (!flag) {
    redirect(`/${locale}/form-builder/${id}/settings`);
  }

  const keyExists = await checkKeyExists(id);

  return <ApiKey keyExists={keyExists} />;
}

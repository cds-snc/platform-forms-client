import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { ApiKey } from "./components/client/ApiKey";
import { authCheckAndRedirect } from "@lib/actions";
import { checkKeyExists } from "@lib/serviceAccount";
import { redirect } from "next/navigation";
import { checkPrivileges } from "@lib/privileges";

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
  const { ability } = await authCheckAndRedirect();
  try {
    checkPrivileges(ability, [
      {
        action: "view",
        subject: "FormRecord",
      },
    ]);
  } catch (e) {
    // User does not have Manage All Forms permission
    redirect(`/${locale}/form-builder/${id}/settings`);
  }

  const keyExists = await checkKeyExists(id);

  return <ApiKey keyExists={keyExists} />;
}

import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { authCheckAndRedirect } from "@lib/actions";
import { checkKeyExists } from "@lib/serviceAccount";
import { redirect } from "next/navigation";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { isProductionEnvironment } from "@lib/origin";
import { ApiKeyButton } from "./components/ApiKeyButton";
import { ApiKeyDialog } from "../../components/dialogs/ApiKeyDialog/ApiKeyDialog";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("gcFormsSettings")} — ${t("gcForms")}`,
  };
}

export default async function Page(props: { params: Promise<{ id: string; locale: string }> }) {
  const params = await props.params;

  const { id, locale } = params;

  const { ability } = await authCheckAndRedirect();
  const { t } = await serverTranslation("form-builder", { lang: locale });

  // If this production environment, check to ensure user has Manage All Forms permission
  if (
    (await isProductionEnvironment()) &&
    !checkPrivilegesAsBoolean(ability, [
      {
        action: "view",
        subject: "FormRecord",
      },
    ])
  ) {
    redirect(`/${locale}/form-builder/${id}/settings`);
  }

  const keyId = await checkKeyExists(id);

  return (
    <>
      <div className="mb-10">
        <h2 className="mb-6">{t("settings.api.title")}</h2>
        <ApiKeyButton showDelete keyId={keyId} />
      </div>
      <ApiKeyDialog />
    </>
  );
}

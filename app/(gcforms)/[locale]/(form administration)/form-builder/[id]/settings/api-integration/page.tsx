import { redirect } from "next/navigation";
import { Metadata } from "next";
import Markdown from "markdown-to-jsx";

import { serverTranslation } from "@i18n";
import { authCheckAndThrow } from "@lib/actions";
import { ApiKey } from "./components/ApiKey";
import { ApiKeyDialog } from "../../components/dialogs/ApiKeyDialog/ApiKeyDialog";
import { DeleteApiKeyDialog } from "../../components/dialogs/DeleteApiKeyDialog/DeleteApiKeyDialog";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("settings.apiIntegration.navigation.title")} — ${t("gcForms")}`,
  };
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;

  const { locale } = params;

  const { session } = await authCheckAndThrow().catch(() => ({ session: null }));

  const { t } = await serverTranslation("form-builder", { lang: locale });

  if (session && !session.user.acceptableUse) {
    // If they haven't agreed to Acceptable Use redirect to policy page for acceptance
    redirect(`/${locale}/auth/policy`);
  }

  if (session && !session.user.hasSecurityQuestions) {
    // If they haven't setup security questions Use redirect to policy page for acceptance
    redirect(`/${locale}/auth/setup-security-questions`);
  }

  return (
    <>
      {" "}
      <div className="w-7/12">
        <h2 className="mb-6">{t("settings.apiIntegration.page.title")}</h2>
        <p className="mb-4">{t("settings.apiIntegration.page.text1")}</p>
        <Markdown options={{ forceBlock: true }} className="mb-4">
          {t("settings.apiIntegration.page.text2")}
        </Markdown>
        <ApiKey />
        <ul className="mb-6 ml-5 p-0">
          <li>{t("settings.apiIntegration.page.notes.text1")}</li>
          <li>{t("settings.apiIntegration.page.notes.text2")}</li>
          <li>{t("settings.apiIntegration.page.notes.text3")}</li>
          <li>{t("settings.apiIntegration.page.notes.text4")}</li>
        </ul>
      </div>
      <p className="mb-2">
        <strong>{t("settings.apiIntegration.page.apiKey.title")}</strong>
      </p>
      <p className="mb-6">{t("settings.apiIntegration.page.apiKey.description")}</p>
      <p className="mb-4">
        <strong>{t("settings.apiIntegration.page.apiKey.rateLimit.title")}</strong>
      </p>
      <p className="text-sm">
        <strong>{t("settings.apiIntegration.page.apiKey.rateLimit.currentLimit")}</strong>
      </p>
      <p className="mb-2">
        {t("settings.apiIntegration.page.apiKey.rateLimit.currentLimitDescription")}
      </p>
      <Markdown options={{ forceBlock: true }} className="mb-4">
        {t("settings.apiIntegration.page.apiKey.rateLimit.increaseRequest")}
      </Markdown>
      <ApiKeyDialog />
      <DeleteApiKeyDialog />
    </>
  );
}

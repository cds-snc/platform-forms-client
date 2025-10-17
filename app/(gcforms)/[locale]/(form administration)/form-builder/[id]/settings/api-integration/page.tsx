import { redirect } from "next/navigation";
import { Metadata } from "next";

import { serverTranslation } from "@i18n";
import { authCheckAndThrow } from "@lib/actions";
import { ApiKey } from "./components/ApiKey";

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
    <div className="w-4/6">
      <h2 className="mb-6">{t("settings.apiIntegration.page.title")}</h2>
      <p className="block text-sm">{t("settings.apiIntegration.page.description")}</p>
      <ApiKey />
    </div>
  );
}

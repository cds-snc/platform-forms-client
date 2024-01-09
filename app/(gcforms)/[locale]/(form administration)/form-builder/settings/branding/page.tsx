import { serverTranslation } from "@i18n";
import { getAppSession } from "@api/auth/authConfig";
import { Branding } from "@clientComponents/form-builder/app/branding";
import { SettingsNavigation } from "@clientComponents/form-builder/app/navigation/SettingsNavigation";
import { getAppSetting } from "@lib/appSettings";
import { FormBuilderInitializer } from "@clientComponents/globals/layouts/FormBuilderLayout";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("branding.heading")} — ${t("gcForms")}`,
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const { t } = await serverTranslation("form-builder");
  const session = await getAppSession();
  if (session && !session.user.acceptableUse) {
    // If they haven't agreed to Acceptable Use redirect to policy page for acceptance
    redirect(`/${locale}/auth/policy`);
  }

  if (session && !session.user.hasSecurityQuestions) {
    // If they haven't setup security questions Use redirect to policy page for acceptance
    redirect(`/${locale}/auth/setup-security-questions`);
  }

  const hasBrandingRequestForm = Boolean(await getAppSetting("brandingRequestForm"));

  return (
    <FormBuilderInitializer locale={locale}>
      <div className="max-w-4xl">
        <h1>{t("gcFormsSettings")}</h1>
        <p className="mb-5 inline-block bg-purple-200 p-3 text-sm font-bold">
          {t("settingsResponseDelivery.beforePublishMessage")}
        </p>
        <SettingsNavigation />
        <Branding hasBrandingRequestForm={hasBrandingRequestForm} />
      </div>
    </FormBuilderInitializer>
  );
}

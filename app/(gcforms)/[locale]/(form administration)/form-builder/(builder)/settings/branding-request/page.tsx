import { serverTranslation } from "@i18n";
import { auth } from "@lib/auth";
import { getPublicTemplateByID } from "@lib/templates";
import { BrandingRequestForm } from "@clientComponents/form-builder/app/branding";
import { getAppSetting } from "@lib/appSettings";
import { FormBuilderInitializer } from "@clientComponents/globals/layouts/FormBuilderLayout";
import { redirect, notFound } from "next/navigation";
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
  const session = await auth();

  if (session && !session.user.acceptableUse) {
    // If they haven't agreed to Acceptable Use redirect to policy page for acceptance
    redirect(`/${locale}/auth/policy`);
  }

  if (session && !session.user.hasSecurityQuestions) {
    // If they haven't setup security questions Use redirect to policy page for acceptance
    redirect(`/${locale}/auth/setup-security-questions`);
  }

  const brandingRequestFormSetting = await getAppSetting("brandingRequestForm");

  if (!brandingRequestFormSetting) {
    notFound();
  }

  const brandingRequestForm = await getPublicTemplateByID(brandingRequestFormSetting);

  return (
    <FormBuilderInitializer locale={locale}>
      <BrandingRequestForm formRecord={brandingRequestForm} />
    </FormBuilderInitializer>
  );
}

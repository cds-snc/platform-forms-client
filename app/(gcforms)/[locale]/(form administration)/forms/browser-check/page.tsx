import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccessControlError } from "@lib/auth/errors";
import { authCheckAndRedirect } from "@lib/actions";

import { FileAPITest } from "./components/FileAPITest";
import { AdditionalResourcesSection } from "./components/AdditionalResourcesSection";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const { t } = await serverTranslation("browser-check", { lang: locale });

  return {
    title: `${t("title")}`,
  };
}

export default async function FileAPITestPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const { locale } = params;

  let userEmail: string | undefined;
  try {
    const result = await authCheckAndRedirect();
    userEmail = result.session?.user?.email;
  } catch (e) {
    if (e instanceof AccessControlError) {
      redirect(`/${locale}/admin/unauthorized`);
    }
    throw e;
  }

  return (
    <div className="my-10">
      <div className="grid grid-cols-[1fr_450px] items-start gap-28">
        <FileAPITest locale={locale} userEmail={userEmail} />
        <AdditionalResourcesSection locale={locale} />
      </div>
    </div>
  );
}

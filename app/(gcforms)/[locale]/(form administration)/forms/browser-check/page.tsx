import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { FileAPITestComponent } from "./components/FileAPITestComponent";
import { AdditionalResourcesSection } from "./components/AdditionalResourcesSection";
import { authCheckAndRedirect } from "@lib/actions";
import { AccessControlError } from "@lib/auth/errors";
import { redirect } from "next/navigation";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const { t } = await serverTranslation("browser-check", { lang: locale });

  return {
    title: `${t("title", "Browser compatibility")} — GCForms`,
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
    <div className="mx-20 my-10">
      <div className="grid grid-cols-[1fr_450px] gap-8">
        {/* Left Column: Test Component */}
        <FileAPITestComponent locale={locale} userEmail={userEmail} />

        {/* Right Column: Resources */}
        <div className="rounded-2xl border-1 border-[#D1D5DB] bg-white p-6">
          <AdditionalResourcesSection locale={locale} />
        </div>
      </div>
    </div>
  );
}

import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { FileAPITestComponent } from "./FileAPITestComponent";
import { AdditionalResourcesSection } from "./AdditionalResourcesSection";

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
  return (
    <div className="grid grid-cols-2 gap-8">
      {/* Left Column: Test Component */}
      <FileAPITestComponent locale={locale} />

      {/* Right Column: Resources */}
      <div className="rounded-2xl border-1 border-slate-200 bg-white p-6">
        <AdditionalResourcesSection locale={locale} />
      </div>
    </div>
  );
}

import { BrandHeader } from "@serverComponents/globals/GcdsHeader/BrandHeader";
import { options } from "@formBuilder/[id]/settings/components/branding/options";
import type { BrandProperties } from "@lib/types";
import type { Language } from "@lib/types/form-builder-types";
import { serverTranslation } from "@i18n";

const englishBrandingOptions = options as BrandProperties[];

export default async function BrandingPreviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const language: Language = locale === "fr" ? "fr" : "en";
  const { t } = await serverTranslation("admin-branding", { lang: language });

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="mb-2">{t("title")}</h1>
        <p className="text-sm text-slate-600">{t("description")}</p>
      </div>

      <div className="space-y-8">
        {englishBrandingOptions.map((brand) => (
          <section
            key={brand.name}
            className="overflow-hidden border border-slate-300 bg-white"
            data-testid={`branding-preview-${brand.name}`}
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-300 px-4 py-3">
              <h2 className="m-0 text-lg">{brand.name}</h2>
              <code className="text-sm text-slate-600">
                {language === "fr" ? brand.logoFr : brand.logoEn}
              </code>
            </div>
            <BrandHeader
              brand={brand}
              pathname={`/${language}/admin/branding`}
              language={language}
              skipLink={false}
            />
          </section>
        ))}
      </div>
    </div>
  );
}

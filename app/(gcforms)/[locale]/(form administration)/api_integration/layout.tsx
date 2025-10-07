import { serverTranslation } from "@i18n";
import Link from "next/link";
import { LanguageToggle } from "@clientComponents/globals";

import { SkipLink } from "@serverComponents/globals/SkipLink";
import { Footer } from "@serverComponents/globals/Footer";

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;

  const { locale } = params;

  const { children } = props;

  const { t } = await serverTranslation("common", { lang: locale });

  return (
    <div className="flex min-h-full flex-col bg-gray-soft">
      <SkipLink />
      <header className="mb-4 bg-white px-16 py-6 laptop:px-32">
        <div className="flex justify-between">
          <div className="canada-flag">
            <Link href={t("fip.link")} aria-label={t("fip.text")}>
              <picture>
                <img
                  src={`/img/sig-blk-${locale}.svg`}
                  alt={t("fip.text")}
                  className={"max-h-[40px]"}
                />
              </picture>
            </Link>
          </div>
          <div className="inline-flex gap-4">
            <LanguageToggle />
          </div>
        </div>
      </header>

      <div id="page-container" className="gc-authpages">
        {children}
      </div>
      <Footer displayFormBuilderFooter />
    </div>
  );
}

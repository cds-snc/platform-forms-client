import { serverTranslation } from "@i18n";
import Link from "next/link";
import { LanguageToggle } from "@clientComponents/globals";
import { LoginMenu } from "./components/client/LoginMenu";
import { FormsLink } from "./components/client/FormsLink";
import { SiteLogo } from "@serverComponents/icons";
import { ToastContainer } from "@formBuilder/components/shared/Toast";
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
            <FormsLink />
            <LoginMenu />
            <LanguageToggle />
          </div>
        </div>
      </header>
      <div id="page-container" className="gc-authpages">
        <div className="account-wrapper mt-10 flex items-center justify-center">
          <div
            className={`rounded-2xl border-1 border-[#D1D5DB] bg-white p-10 tablet:w-[768px] has-[#auth-panel]:tablet:w-[658px] laptop:w-[850px]`}
          >
            <main id="content">
              <Link
                className="mb-6 mr-10 inline-flex no-underline focus:bg-white"
                href={`/${locale}/form-builder`}
              >
                <span className="">
                  <SiteLogo title={t("title")} />
                </span>
                <span className="ml-3 inline-block text-[24px] font-semibold leading-10 text-[#1B00C2]">
                  {t("title", { ns: "common" })}
                </span>
              </Link>
              {children}
              <ToastContainer autoClose={false} containerId="default" />
            </main>
          </div>
        </div>
      </div>
      <Footer displayFormBuilderFooter />
    </div>
  );
}

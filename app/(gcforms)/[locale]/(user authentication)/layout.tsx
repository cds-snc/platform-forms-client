import { serverTranslation } from "@i18n";
import Link from "next/link";
import { LanguageToggle } from "@clientComponents/globals";
import { Footer, SkipLink } from "@serverComponents/globals";
import { LoginMenu } from "./components/client/LoginMenu";
import { FormsLink } from "./components/client/FormsLink";
import { SiteLogo } from "@serverComponents/icons";
import { ToastContainer } from "@formBuilder/components/shared/Toast";
import { headers } from "next/headers";
import { Info as AlertInfo } from "@clientComponents/globals/Alert/Alert";

const Info = async ({ locale }: { locale: string }) => {
  const { t } = await serverTranslation(["setup-security-questions"], { lang: locale });
  return (
    <div className="mx-auto mt-10 w-[850px]">
      <AlertInfo title={t("banner.title")} body={t("banner.body")} />
    </div>
  );
};

export default async function Layout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { t } = await serverTranslation("common", { lang: locale });
  const headersList = headers();
  const currentPath = headersList.get("x-path")?.replace(`/${locale}`, "");

  return (
    <div className="flex min-h-full flex-col bg-gray-soft">
      <SkipLink />

      <header className="mb-4 bg-white px-[4rem] py-6 laptop:px-32">
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
        {/* Until a better solution is found this adds the banner before the content on the setup security questions page */}
        {currentPath?.startsWith("/auth/setup-security-questions") && <Info locale={locale} />}
        <div className="account-wrapper mt-10 flex items-center justify-center">
          <div
            className={`has-[#auth-panel]:tablet:w-[658px] tablet:w-[768px] laptop:w-[850px] rounded-2xl border-1 border-[#D1D5DB] bg-white p-10`}
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

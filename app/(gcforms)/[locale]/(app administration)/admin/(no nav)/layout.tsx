import { ToastContainer } from "@formBuilder/components/shared/Toast";

import Link from "next/link";
import { serverTranslation } from "@i18n";
import { SiteLogo } from "@serverComponents/icons";

import LanguageToggle from "@serverComponents/globals/LanguageToggle";
import { YourAccountDropdown } from "@clientComponents/globals/Header/YourAccountDropdown";

import { SkipLink } from "@serverComponents/globals/SkipLink";
import { Footer } from "@serverComponents/globals/Footer";
import { AuthenticatedLayout } from "@lib/pages/auth";
import { authorization } from "@lib/privileges";

export default AuthenticatedLayout(
  [authorization.hasAdministrationPrivileges],
  async ({ children, params }) => {
    const { locale } = await params;

    const { t } = await serverTranslation(["common", "admin-login"], { lang: locale });

    return (
      <div className={`flex h-full flex-col bg-gray-50`}>
        <div className="flex h-full flex-col">
          <SkipLink />
          <header className={"mb-5 border-b-1 border-gray-500 bg-white px-0 py-2"}>
            <div className="grid w-full grid-flow-col">
              <div className="flex">
                <Link
                  id="logo"
                  href={`/${locale}/form-builder`}
                  className="mr-5 flex border-r-1 pr-[0.77rem] text-3xl font-semibold !text-black no-underline focus:bg-white"
                >
                  <div className="inline-block h-[45px] w-[46px] p-2">
                    <SiteLogo title={t("title")} />
                  </div>
                </Link>

                <div className="mt-3 box-border block h-[40px] px-2 py-1 text-xl font-semibold">
                  {t("title", { ns: "admin-login" })}
                </div>
              </div>
              <nav
                className="justify-self-end"
                aria-label={t("mainNavAriaLabel", { ns: "common" })}
              >
                <ul className="mt-2 flex list-none px-0 text-base">
                  <li className="mr-2 py-2 text-base tablet:mr-4">
                    <Link href={`/${locale}/forms`}>{t("adminNav.myForms", { ns: "common" })}</Link>
                  </li>
                  <li className="mr-2 py-2 tablet:mr-4">
                    <LanguageToggle />
                  </li>
                  <li className="mr-5 text-base">
                    <YourAccountDropdown isAuthenticated={true} />
                  </li>
                </ul>
              </nav>
            </div>
          </header>
          <div className="mx-4 shrink-0 grow basis-auto laptop:mx-32 desktop:mx-64">
            <ToastContainer />
            <>
              <div>
                <main id="content">{children}</main>
              </div>
            </>
          </div>
          <Footer displayFormBuilderFooter />
        </div>
      </div>
    );
  }
);

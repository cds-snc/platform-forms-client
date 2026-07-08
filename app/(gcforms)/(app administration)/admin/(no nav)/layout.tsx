import { ToastContainer } from "@formBuilder/components/shared/Toast";

import Link from "next/link";
import { I18n } from "@i18n";
import { SiteLogo } from "@serverComponents/icons";

import { SkipLink } from "@clientComponents/globals/SkipLink";
import { Footer } from "@root/components/serverComponents/globals/Footer/Footer";
import { AuthenticatedLayout } from "@lib/pages/auth";
import { authorization } from "@lib/privileges";
import { Nav } from "./components/Nav";
export default AuthenticatedLayout(
  [authorization.hasAdministrationPrivileges],
  async ({ children }) => {
    return (
      <div className={`flex h-full flex-col bg-gray-50`}>
        <div className="flex h-full flex-col">
          <SkipLink />
          <header className={"mb-5 border-b-1 border-gray-500 bg-white px-0 py-2"}>
            <div className="grid w-full grid-flow-col">
              <div className="flex">
                <Link
                  id="logo"
                  href={`/form-builder`}
                  className="mr-7 flex border-r-1 pr-[0.77rem] text-3xl font-semibold !text-black no-underline focus:bg-white"
                >
                  <div className="inline-block h-[45px] w-[46px] p-2">
                    <SiteLogo />
                  </div>
                </Link>

                <div className="mt-3 box-border block h-[40px] px-2 py-1 text-xl font-semibold">
                  <I18n i18nKey="title" namespace="admin-login" />
                </div>
              </div>
              <Nav />
            </div>
          </header>
          <div className="laptop:mx-32 desktop:mx-64 mx-4 shrink-0 grow basis-auto">
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

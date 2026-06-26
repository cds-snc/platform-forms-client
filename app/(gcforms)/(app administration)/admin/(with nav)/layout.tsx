import { ToastContainer } from "@formBuilder/components/shared/Toast";
import { LeftNavigation } from "@serverComponents/admin/LeftNavigation";
import Link from "next/link";
import { SiteLogo } from "@serverComponents/icons";
import { SkipLink } from "@clientComponents/globals/SkipLink";
import { Footer } from "@root/components/serverComponents/globals/Footer/Footer";
import { AuthenticatedLayout } from "@lib/pages/auth";
import { authorization } from "@lib/privileges";
import { I18n } from "@root/i18n";
import { Nav } from "./components/Nav";

export default AuthenticatedLayout(
  [authorization.hasAdministrationPrivileges],
  async ({ children }) => {
    return (
      <div className={`flex h-full flex-col`}>
        <div className="flex h-full flex-col">
          <SkipLink />

          <header className={"mb-5 border-b-1 border-gray-500 bg-white px-0 py-2"}>
            <div className="grid w-full grid-flow-col">
              <div className="flex">
                <Link
                  href={`/form-builder`}
                  id="logo"
                  className="mr-7 flex border-r-1 pr-[0.77rem] text-3xl font-semibold !text-black no-underline focus:bg-white"
                  prefetch={false}
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
          <div className="shrink-0 grow basis-auto">
            <ToastContainer limit={1} containerId="default" />
            <ToastContainer
              limit={1}
              containerId="wide"
              autoClose={false}
              ariaLabel="Notifications: Alt+T"
              width="600px"
            />
            <>
              <div>
                <div className="flex flex-row gap-10 pr-12">
                  <div
                    id="left-nav"
                    className="sticky top-0 z-10 flex h-dvh border-r border-slate-200 bg-white"
                  >
                    <LeftNavigation />
                  </div>
                  <main id="content" className="w-full">
                    {children}
                  </main>
                </div>
              </div>
            </>
          </div>

          <Footer displayFormBuilderFooter className="mt-0 lg:mt-0" />
        </div>
      </div>
    );
  }
);

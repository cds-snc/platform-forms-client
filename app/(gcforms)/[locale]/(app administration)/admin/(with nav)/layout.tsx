import { Footer, SkipLink } from "@serverComponents/globals";
import { ToastContainer } from "app/(gcforms)/[locale]/(form administration)/form-builder/components/shared/Toast";
import { LeftNavigation } from "@serverComponents/admin/LeftNavigation";
import Link from "next/link";
import { serverTranslation } from "@i18n";
import { SiteLogo } from "@serverComponents/icons";
import LanguageToggle from "@serverComponents/globals/LanguageToggle";
import { YourAccountDropdown } from "@clientComponents/globals/YourAccountDropdown";
import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import { createAbility } from "@lib/privileges";
export default async function Layout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await auth();
  if (!session) redirect(`${locale}/auth/login`);

  const ability = createAbility(session);

  const { t } = await serverTranslation(["common", "admin-login"], { lang: locale });

  return (
    <div className={`flex h-full flex-col`}>
      <div className="flex h-full flex-col">
        <SkipLink />

        <header className={"mb-0 border-b-1 border-gray-500 bg-white px-0 py-2 "}>
          <div className="grid w-full grid-flow-col">
            <div className="flex">
              <Link
                href={`/${locale}/form-builder`}
                id="logo"
                className="mr-5 flex border-r-1 pr-[0.77rem] text-3xl font-semibold !text-black no-underline focus:bg-white"
                prefetch={false}
              >
                <div className="inline-block h-[45px] w-[46px] p-2">
                  <SiteLogo title={t("title")} />
                </div>
              </Link>

              <div className="mt-3 box-border block h-[40px] px-2 py-1 text-xl font-semibold">
                {t("title", { ns: "admin-login" })}
              </div>
            </div>
            <nav className="justify-self-end" aria-label={t("mainNavAriaLabel", { ns: "common" })}>
              <ul className="mt-2 flex list-none px-0 text-base">
                {session?.user?.name && (
                  <li className="mr-2 py-2 pt-3 text-sm tablet:mr-4">
                    {t("logged-in", { ns: "admin-login" })}: <span>{session?.user.email}</span>
                  </li>
                )}
                <li className="mr-2 py-2 text-base tablet:mr-4">
                  <Link href={`/${locale}/forms`} prefetch={false}>
                    {t("adminNav.myForms", { ns: "common" })}
                  </Link>
                </li>

                <li className="mr-2 py-2 tablet:mr-4">
                  <LanguageToggle />
                </li>

                <li className="mr-5 text-base">
                  <YourAccountDropdown isAuthenticated={Boolean(session)} />
                </li>
              </ul>
            </nav>
          </div>
        </header>
        <div className="shrink-0 grow basis-auto">
          <ToastContainer containerId="default" />
          <ToastContainer limit={1} containerId="wide" autoClose={false} width="600px" />
          <>
            <div>
              <div className="flex flex-row gap-10 pr-12">
                <div
                  id="left-nav"
                  className="sticky top-0 z-10 flex h-dvh border-r border-slate-200 bg-white"
                >
                  <LeftNavigation ability={ability} />
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

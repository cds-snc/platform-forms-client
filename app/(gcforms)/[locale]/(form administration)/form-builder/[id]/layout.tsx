import { auth } from "@lib/auth";
import { LeftNavigation } from "app/(gcforms)/[locale]/(form administration)/form-builder/components";
import { ToastContainer } from "app/(gcforms)/[locale]/(form administration)/form-builder/components/shared/Toast";
import { SkipLink, Footer, Header } from "@clientComponents/globals";
import { FormRecord } from "@lib/types";
import { AccessControlError, createAbility } from "@lib/privileges";
import { getFullTemplateByID } from "@lib/templates";
import { redirect } from "next/navigation";
import { TemplateStoreProvider } from "@lib/store";
import { TemplateApiProvider, RefStoreProvider } from "@lib/hooks";

export default async function Layout({
  children,
  params: { locale, id },
}: {
  children: React.ReactNode;
  params: { locale: string; id: string };
}) {
  const FormbuilderParams: { locale: string; initialForm: null | FormRecord } = {
    initialForm: null,
    locale,
  };
  let initialForm;

  const session = await auth();

  const formID = id || null;

  if (session && formID) {
    try {
      const ability = createAbility(session);

      initialForm = await getFullTemplateByID(ability, formID);

      if (initialForm === null) {
        redirect(`/${locale}/404`);
      }

      if (initialForm.isPublished) {
        redirect(`/${locale}/form-builder/settings/${formID}`);
      }

      FormbuilderParams.initialForm = initialForm;
    } catch (e) {
      if (e instanceof AccessControlError) {
        redirect(`/${locale}/admin/unauthorized`);
      }
    }
  }

  return (
    <TemplateStoreProvider {...{ ...initialForm, locale }}>
      <TemplateApiProvider>
        <RefStoreProvider>
          <div className={`flex h-full flex-col`}>
            {/* @TODO: Backlink?? */}
            <div className="flex h-full flex-col">
              <SkipLink />
              <Header context="formBuilder" className="mb-0" />
              <div className="shrink-0 grow basis-auto bg-gray-soft">
                <ToastContainer containerId="default" />
                <ToastContainer limit={1} containerId="wide" autoClose={false} width="600px" />
                <div className="flex h-full flex-row gap-7 pr-12">
                  <div id="left-nav" className="z-10 border-r border-slate-200 bg-white">
                    <div className="sticky top-0">
                      <LeftNavigation id={id} />
                    </div>
                  </div>

                  <main id="content" className="form-builder my-7 w-full">
                    {children}
                  </main>
                </div>
              </div>

              <Footer displayFormBuilderFooter className="mt-0 lg:mt-0" />
            </div>
          </div>
        </RefStoreProvider>
      </TemplateApiProvider>
    </TemplateStoreProvider>
  );
}

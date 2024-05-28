import { authCheckAndThrow } from "@lib/actions";
import { LeftNavigation } from "./components/LeftNavigation";
import { ToastContainer } from "@formBuilder/components/shared/Toast";
import { SkipLink, Footer } from "@clientComponents/globals";
import { Header } from "@clientComponents/globals/Header/Header";
import { FormRecord } from "@lib/types";
import { AccessControlError } from "@lib/privileges";
import { getFullTemplateByID } from "@lib/templates";
import { redirect } from "next/navigation";
import { SaveTemplateProvider } from "@lib/hooks/form-builder/useTemplateContext";
import { RefStoreProvider } from "@lib/hooks/form-builder/useRefStore";
import { RightPanel } from "@formBuilder/components/shared/right-panel/RightPanel";
import { allowGrouping } from "@formBuilder/components/shared/right-panel/treeview/util/allowGrouping";
import { GroupStoreProvider } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { TemplateStoreProvider } from "@lib/store/useTemplateStore";

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

  const { session, ability } = await authCheckAndThrow().catch(() => ({
    session: null,
    ability: null,
  }));

  const formID = id || null;

  const allowGroupsFlag = await allowGrouping();

  if (session && formID) {
    try {
      initialForm = await getFullTemplateByID(ability, formID);

      if (initialForm === null) {
        redirect(`/${locale}/404`);
      }

      if (initialForm.isPublished) {
        redirect(`/${locale}/form-builder/${formID}/settings`);
      }

      FormbuilderParams.initialForm = initialForm;
    } catch (e) {
      if (e instanceof AccessControlError) {
        redirect(`/${locale}/admin/unauthorized`);
      }
    }
  }

  return (
    <TemplateStoreProvider {...{ ...initialForm, locale, allowGroupsFlag }}>
      <SaveTemplateProvider>
        <RefStoreProvider>
          <div className={`flex h-full flex-col`}>
            {/* @TODO: Backlink?? */}
            <div className="flex h-full flex-col">
              <SkipLink />
              <Header context="formBuilder" className="mb-0" />
              <div className="shrink-0 grow basis-auto bg-gray-soft">
                <ToastContainer containerId="default" />
                <ToastContainer limit={1} containerId="wide" autoClose={false} width="600px" />
                <div className="flex h-full flex-row gap-7">
                  <div id="left-nav" className="z-10 border-r border-slate-200 bg-white">
                    <div className="sticky top-0">
                      <LeftNavigation id={id} />
                    </div>
                  </div>
                  <GroupStoreProvider>
                    <main id="content" className="form-builder my-7 w-full">
                      {children}
                    </main>
                    {allowGroupsFlag && <RightPanel id={id} />}
                  </GroupStoreProvider>
                </div>
              </div>

              <Footer displayFormBuilderFooter className="mt-0 lg:mt-0" />
            </div>
          </div>
        </RefStoreProvider>
      </SaveTemplateProvider>
    </TemplateStoreProvider>
  );
}

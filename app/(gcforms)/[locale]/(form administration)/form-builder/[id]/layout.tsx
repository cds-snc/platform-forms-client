import { authCheckAndThrow } from "@lib/actions";
import { LeftNavigation } from "./components/LeftNavigation";
import { ToastContainer } from "@formBuilder/components/shared/Toast";
import { SkipLink, Footer } from "@clientComponents/globals";
import { Header } from "@clientComponents/globals/Header/Header";
import { AccessControlError } from "@lib/privileges";
import { getFullTemplateByID } from "@lib/templates";
import { redirect } from "next/navigation";
import { SaveTemplateProvider } from "@lib/hooks/form-builder/useTemplateContext";
import { RefStoreProvider } from "@lib/hooks/form-builder/useRefStore";
import { RightPanel } from "@formBuilder/components/shared/right-panel/RightPanel";
import { allowGrouping } from "@formBuilder/components/shared/right-panel/treeview/util/allowGrouping";
import { GroupStoreProvider } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { TemplateStoreProvider } from "@lib/store/useTemplateStore";
import { Language } from "@lib/types/form-builder-types";
import { FormRecord } from "@lib/types";
import { logMessage } from "@lib/logger";
import { checkKeyExists } from "@lib/serviceAccount";
import {
  FormBuilderConfigProvider,
  FormBuilderConfig,
  formBuilderConfigDefault,
} from "@lib/hooks/useFormBuilderConfig";

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string; id: string }>;
}) {
  const params = await props.params;

  const { locale, id } = params;

  const { children } = props;

  let initialForm: FormRecord | null = null;

  const { session, ability } = await authCheckAndThrow().catch(() => ({
    session: null,
    ability: null,
  }));

  const formID = id || null;

  const allowGroupsFlag = allowGrouping();

  let apiKey: string | false | void = "";

  if (session && formID && formID !== "0000") {
    initialForm = await getFullTemplateByID(ability, formID).catch((e) => {
      if (e instanceof AccessControlError) {
        redirect(`/${locale}/admin/unauthorized`);
      }
      logMessage.warn(`Error fetching Form Record for form-builder/[id] Layout: ${e.message}`);
      return null;
    });

    if (initialForm === null) {
      redirect(`/${locale}/404`);
    }

    apiKey = await checkKeyExists(formID).catch((e) => {
      logMessage.warn(`Error fetching API key for form-builder/[id] Layout: ${e.message}`);
    });
  }

  const formBuilderConfig: FormBuilderConfig = {
    ...formBuilderConfigDefault,
    ...{ apiKey: apiKey || "" },
  };

  return (
    <FormBuilderConfigProvider formBuilderConfig={formBuilderConfig}>
      <TemplateStoreProvider {...{ ...initialForm, locale, allowGroupsFlag }}>
        <SaveTemplateProvider>
          <RefStoreProvider>
            <div>
              {/* @TODO: Backlink?? */}
              <div className="flex flex-col">
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
                      <main
                        id="content"
                        className="form-builder my-7 w-full min-h-[calc(100vh-300px)]"
                      >
                        {children}
                      </main>
                      {allowGroupsFlag && <RightPanel id={id} lang={locale as Language} />}
                    </GroupStoreProvider>
                  </div>
                </div>
              </div>
              <Footer displayFormBuilderFooter className="mt-0 lg:mt-0" />
            </div>
          </RefStoreProvider>
        </SaveTemplateProvider>
      </TemplateStoreProvider>
    </FormBuilderConfigProvider>
  );
}

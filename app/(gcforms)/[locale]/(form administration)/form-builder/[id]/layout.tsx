import { auth } from "@lib/auth";
import { cn } from "@lib/utils";
import { LeftNavigation } from "@clientComponents/form-builder/app";
import { ToastContainer } from "@clientComponents/form-builder/app/shared/Toast";
import { SkipLink, Footer, Header } from "@clientComponents/globals";
import { FormBuilderProviders } from "@clientComponents/form-builder/providers";
import { FormRecord } from "@lib/types";
import { AccessControlError, createAbility } from "@lib/privileges";
import { getFullTemplateByID } from "@lib/templates";
import { redirect } from "next/navigation";

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

  const session = await auth();

  const formID = id || null;

  if (session && formID) {
    try {
      const ability = createAbility(session);

      const initialForm = await getFullTemplateByID(ability, formID);

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
    <FormBuilderProviders locale={locale}>
      <div className="flex h-full flex-col">
        <SkipLink />
        <Header context="formBuilder" className="mb-0" />
        <div className="shrink-0 grow basis-auto">
          <ToastContainer containerId="default" />
          <ToastContainer limit={1} containerId="wide" autoClose={false} width="600px" />
          <div>
            <div className="flex flex-row gap-10 pr-12">
              <div
                id="left-nav"
                className="sticky top-0 z-10 flex h-dvh border-r border-slate-200 bg-white"
              >
                <LeftNavigation id={id} />
              </div>
              <main id="content" className={cn("w-full form-builder mt-5 mb-10")}>
                <div className="max-w-4xl">{children}</div>
              </main>
            </div>
          </div>
        </div>

        <Footer displayFormBuilderFooter className="mt-0 lg:mt-0" />
      </div>
    </FormBuilderProviders>
  );
}

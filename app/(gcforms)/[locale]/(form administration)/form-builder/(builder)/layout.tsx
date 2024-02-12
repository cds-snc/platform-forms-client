import { LeftNavigation } from "@clientComponents/form-builder/app";
import { ToastContainer } from "@clientComponents/form-builder/app/shared/Toast";
import { SkipLink, Footer, Header } from "@clientComponents/globals";
import { cn } from "@lib/utils";
import { FormBuilderProviders } from "@clientComponents/form-builder/providers";

export default async function Layout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <FormBuilderProviders locale={locale}>
      <div className="flex h-full flex-col">
        <SkipLink />

        <Header context="formBuilder" className="mb-0" />
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
                  <LeftNavigation />
                </div>
                <main id="content" className={cn("w-full form-builder mt-5 mb-10")}>
                  {children}
                </main>
              </div>
            </div>
          </>
        </div>

        <Footer displayFormBuilderFooter className="mt-0 lg:mt-0" />
      </div>
    </FormBuilderProviders>
  );
}

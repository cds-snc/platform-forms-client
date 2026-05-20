import React from "react";
import { ToastContainer } from "@formBuilder/components/shared/Toast";
import { Header } from "@clientComponents/globals/Header/Header";
import { SaveTemplateProvider } from "@lib/hooks/form-builder/useTemplateContext";
import { TemplateStoreProvider } from "@lib/store/useTemplateStore";
import { SkipLink } from "@serverComponents/globals/SkipLink";
import { Footer } from "@serverComponents/globals/Footer";
import { AuthenticatedLayout } from "@lib/pages/auth";
import { authorization } from "@lib/privileges";

export default AuthenticatedLayout(async ({ children, params, session }) => {
  const { locale } = await params;
  const publishFormsEnabled = await authorization.hasPublishFormsPrivilege().catch(() => false);

  return (
    <TemplateStoreProvider {...{ locale }}>
      <SaveTemplateProvider>
        <div className="bkd-soft flex h-full flex-col">
          <SkipLink />
          <Header
            context={"default"}
            showAccountMenu={!!session}
            accountMenuPublishingEnabled={publishFormsEnabled}
          />
          <div className="laptop:mx-32 desktop:mx-64 mx-4 shrink-0 grow basis-auto">
            <main id="content" className="mb-10">
              {children}
            </main>
            <ToastContainer containerId="default" />
          </div>
          <Footer displayFormBuilderFooter className="mt-0" />
        </div>
      </SaveTemplateProvider>
    </TemplateStoreProvider>
  );
});

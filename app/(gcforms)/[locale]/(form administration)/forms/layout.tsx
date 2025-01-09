import React from "react";
import { ToastContainer } from "@formBuilder/components/shared/Toast";
import { Header } from "@clientComponents/globals/Header/Header";
import { authCheckAndRedirect } from "@lib/actions";
import { SaveTemplateProvider } from "@lib/hooks/form-builder/useTemplateContext";
import { TemplateStoreProvider } from "@lib/store/useTemplateStore";
import { SkipLink } from "@serverComponents/globals/SkipLink";
import { Footer } from "@serverComponents/globals/Footer";

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;

  const { locale } = params;

  const { children } = props;

  await authCheckAndRedirect();

  return (
    <TemplateStoreProvider {...{ locale }}>
      <SaveTemplateProvider>
        <div className="bkd-soft flex h-full flex-col">
          <SkipLink />
          <Header context={"default"} />
          <div className="mx-4 shrink-0 grow basis-auto laptop:mx-32 desktop:mx-64">
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
}

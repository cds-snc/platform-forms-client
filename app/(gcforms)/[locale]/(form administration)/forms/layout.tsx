import React from "react";
import { ToastContainer } from "@formBuilder/components/shared/Toast";
import { Header } from "@clientComponents/globals/Header/Header";
import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import { SaveTemplateProvider } from "@lib/hooks/form-builder/useTemplateContext";
import { TemplateStoreProvider } from "@lib/store/useTemplateStore";
import { SkipLink } from "@serverComponents/globals/SkipLink";
import { Footer } from "@serverComponents/globals/Footer";

export default async function Layout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await auth();
  if (!session) redirect(`/${locale}/auth/login`);

  return (
    <TemplateStoreProvider {...{ locale }}>
      <SaveTemplateProvider>
        <div className="flex h-full flex-col bkd-soft">
          <SkipLink />
          <Header context={"default"} />
          <div className="mx-4 shrink-0 grow basis-auto laptop:mx-32 desktop:mx-64">
            <main id="content" className="mb-10">
              {children}
            </main>
            <ToastContainer />
          </div>
          <Footer displayFormBuilderFooter className="mt-0" />
        </div>
      </SaveTemplateProvider>
    </TemplateStoreProvider>
  );
}

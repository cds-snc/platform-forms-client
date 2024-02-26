import React from "react";
import { ToastContainer } from "@clientComponents/form-builder/app/shared/Toast";
import { Header } from "@clientComponents/globals";
import { Footer, SkipLink } from "@serverComponents/globals";
import { auth } from "@lib/auth";
import { redirect } from "next/navigation";

export default async function FormsLayout({
  children,
  params: { locale },
  user,
  context,
}: {
  children: React.ReactNode;
  params: { locale: string };
  user?: { name: string | null; email: string };
  context?: "admin" | "formBuilder" | "default";
}) {
  const session = await auth();
  if (!session) redirect(`/${locale}/auth/login`);

  return (
    <>
      <div className="flex h-full flex-col">
        <SkipLink />

        <Header context={context} user={user && { email: user.email, name: user.name }} />
        <div className="mx-4 shrink-0 grow basis-auto laptop:mx-32 desktop:mx-64">
          <ToastContainer />
          <>
            <div>
              <main id="content">{children}</main>
            </div>
          </>
        </div>
        <Footer displayFormBuilderFooter />
      </div>
    </>
  );
}

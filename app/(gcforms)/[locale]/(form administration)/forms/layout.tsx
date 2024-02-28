import React from "react";
import { ToastContainer } from "@clientComponents/form-builder/app/shared/Toast";
import { Header } from "@clientComponents/globals";
import { Footer, SkipLink } from "@serverComponents/globals";
import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import { createAbility } from "@lib/privileges";
import { getUser } from "@lib/users";

export default async function Layout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await auth();
  if (!session) redirect(`/${locale}/auth/login`);
  const ability = createAbility(session);
  const user = await getUser(ability, session.user.id);

  return (
    <>
      <div className="flex h-full flex-col">
        <SkipLink />
        <Header context={"default"} user={user && { email: user.email, name: user.name }} />
        <div className="mx-4 shrink-0 grow basis-auto laptop:mx-32 desktop:mx-64">
          <main id="content">{children}</main>
          <ToastContainer />
        </div>
        <Footer displayFormBuilderFooter />
      </div>
    </>
  );
}

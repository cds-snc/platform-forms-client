import { Suspense } from "react";
import { serverTranslation } from "@i18n";
import { auth } from "@lib/auth";
import { checkPrivilegesAsBoolean, createAbility } from "@lib/privileges";
import { Metadata } from "next";
import { FlagList } from "./components/server/FlagList";
import { Loader } from "@clientComponents/globals/Loader";
import { redirect } from "next/navigation";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("admin-flags", { lang: locale });
  return {
    title: `${t("title")}`,
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const session = await auth();
  if (!session) redirect(`/${locale}/auth/login`);
  const ability = createAbility(session);

  checkPrivilegesAsBoolean(ability, [{ action: "view", subject: "Flag" }], { redirect: true });

  const { t } = await serverTranslation("admin-flags");

  return (
    <>
      <h1 className="border-0 mb-10">{t("title")}</h1>
      <p className="pb-8">{t("subTitle")}</p>
      <Suspense fallback={<Loader />}>
        <FlagList ability={ability} />
      </Suspense>
    </>
  );
}

import { Suspense } from "react";
import { serverTranslation } from "@i18n";
import { requireAuthentication } from "@lib/auth";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { Metadata } from "next";
import { FlagList } from "./components/server/FlagList";
import { Loader } from "@clientComponents/globals/Loader";

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

export default async function Page() {
  const { user } = await requireAuthentication();

  checkPrivilegesAsBoolean(user.ability, [{ action: "view", subject: "Flag" }], { redirect: true });

  const { t } = await serverTranslation("admin-flags");

  return (
    <>
      <h1 className="border-0 mb-10">{t("title")}</h1>
      <p className="pb-8">{t("subTitle")}</p>
      <Suspense fallback={<Loader />}>
        <FlagList ability={user.ability} />
      </Suspense>
    </>
  );
}

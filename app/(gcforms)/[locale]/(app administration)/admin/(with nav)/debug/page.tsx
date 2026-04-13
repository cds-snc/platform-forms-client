import { serverTranslation } from "@i18n";
import { authorization } from "@lib/privileges";
import { Metadata } from "next";
import { AuthenticatedPage } from "@lib/pages/auth";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("admin-debug", { lang: locale });
  return {
    title: `${t("title")}`,
  };
}

export default AuthenticatedPage([authorization.hasAdministrationPrivileges], async () => {
  const { t } = await serverTranslation("admin-debug");

  return (
    <>
      <h1 className="mb-6 border-0">{t("title")}</h1>
      <p className="mb-8 max-w-3xl">{t("description")}</p>

      <section className="max-w-3xl rounded-lg border border-slate-200 bg-white p-8">
        <h2 className="mt-0">{t("placeholderTitle")}</h2>
        <p className="mb-0">{t("placeholderBody")}</p>
      </section>
    </>
  );
});

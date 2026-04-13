import { serverTranslation } from "@i18n";
import { AuthenticatedPage } from "@lib/pages/auth";
import { authorization } from "@lib/privileges";
import { Metadata } from "next";
import { EditLockDebugPanel } from "./EditLockDebugPanel";

export async function generateMetadata(props: {
  params: Promise<{ locale: string; formId: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("admin-debug", { lang: locale });
  return {
    title: `${t("title")} - ${t("formDebugTitle")}`,
  };
}

export default AuthenticatedPage<{ formId: string }>(
  [authorization.hasAdministrationPrivileges],
  async ({ params }) => {
    const { formId } = await params;
    const { t } = await serverTranslation("admin-debug");

    return (
      <>
        <h1 className="mb-4 border-0">{t("formDebugTitle")}</h1>
        <p className="mb-8 max-w-3xl">{t("formDebugDescription")}</p>
        <EditLockDebugPanel formId={formId} />
      </>
    );
  }
);

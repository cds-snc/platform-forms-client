import JSONUpload from "@clientComponents/admin/JsonUpload/JsonUpload";
import { serverTranslation } from "@i18n";
import { authorization } from "@lib/privileges";
import { Metadata } from "next";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("admin-templates", { lang: locale });
  return {
    title: `${t("upload.title")}`,
  };
}

export default async function Page() {
  const { t } = await serverTranslation("admin-templates");
  await authorization.canManageAllForms().catch(() => {
    authorization.unauthorizedRedirect();
  });

  return (
    <>
      <h1>{t("upload.title")}</h1>
      <JSONUpload></JSONUpload>
    </>
  );
}

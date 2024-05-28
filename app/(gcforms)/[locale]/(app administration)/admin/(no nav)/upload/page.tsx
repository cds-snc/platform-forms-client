import JSONUpload from "@clientComponents/admin/JsonUpload/JsonUpload";
import { serverTranslation } from "@i18n";
import { authCheckAndRedirect } from "@lib/actions";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { Metadata } from "next";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("admin-templates", { lang: locale });
  return {
    title: `${t("upload.title")}`,
  };
}

export default async function Page() {
  const { t } = await serverTranslation("admin-templates");

  const { ability } = await authCheckAndRedirect();

  checkPrivilegesAsBoolean(ability, [{ action: "create", subject: "FormRecord" }], {
    redirect: true,
  });
  return (
    <>
      <h1>{t("upload.title")}</h1>
      <JSONUpload></JSONUpload>
    </>
  );
}

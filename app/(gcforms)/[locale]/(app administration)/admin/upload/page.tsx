import JSONUpload from "@clientComponents/admin/JsonUpload/JsonUpload";
import { serverTranslation } from "@i18n";
import { requireAuthentication } from "@lib/auth";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import AdminNavLayout from "@clientComponents/globals/layouts/AdminNavLayout";
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
  const { user } = await requireAuthentication();
  checkPrivilegesAsBoolean(user.ability, [{ action: "create", subject: "FormRecord" }], {
    redirect: true,
  });
  return (
    <AdminNavLayout user={user}>
      <h1>{t("upload.title")}</h1>
      <JSONUpload></JSONUpload>
    </AdminNavLayout>
  );
}

import JSONUpload from "@clientComponents/admin/JsonUpload/JsonUpload";
import { serverTranslation } from "@i18n";
import { authCheck } from "@lib/actions";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { Metadata } from "next";
import { redirect } from "next/navigation";

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

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const { t } = await serverTranslation("admin-templates");

  const { ability } = await authCheck().catch(() => {
    redirect(`/${locale}/auth/login`);
  });

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

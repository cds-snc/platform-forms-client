import JSONUpload from "@clientComponents/admin/JsonUpload/JsonUpload";
import { serverTranslation } from "@i18n";
import { auth } from "@lib/auth";
import { checkPrivilegesAsBoolean, createAbility } from "@lib/privileges";
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
  const session = await auth();
  if (!session) redirect(`/${locale}/auth/login`);
  const ability = createAbility(session);

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

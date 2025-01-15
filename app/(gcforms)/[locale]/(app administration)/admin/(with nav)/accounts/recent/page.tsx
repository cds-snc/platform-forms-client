import { serverTranslation } from "@i18n";
import { authCheckAndRedirect } from "@lib/actions/auth";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { redirect } from "next/navigation";

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation(["admin-accounts"]);

  const { ability } = await authCheckAndRedirect();

  const canViewUsers = checkPrivilegesAsBoolean(ability, [{ action: "view", subject: "User" }], {
    redirect: true,
  });

  if (!canViewUsers) {
    redirect(`/${locale}/forms`);
  }

  return (
    <>
      <h1>{t("title")}</h1>
    </>
  );
}

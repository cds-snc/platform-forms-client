import { serverTranslation } from "@i18n";
import { requireAuthentication } from "@lib/auth";
import { checkPrivilegesAsBoolean, getAllPrivileges } from "@lib/privileges";
import { getUser } from "@lib/users";
import { ManagePermissions } from "./clientSide";
import { Metadata } from "next";
import { TwoColumnLayout } from "@clientComponents/globals/layouts";
import { BackLink } from "@clientComponents/admin/LeftNav/BackLink";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("admin-users", { lang: locale });
  return {
    title: `${t("managePermissions")}`,
  };
}

const BackToAccounts = async ({ id, locale }: { id: string; locale: string }) => {
  const { t } = await serverTranslation("admin-users");
  return <BackLink href={`${locale}/admin/accounts?id=${id}`}>{t("backToAccounts")}</BackLink>;
};

export default async function Page({
  params: { id, locale },
}: {
  params: { id: string; locale: string };
}) {
  const { user } = await requireAuthentication();
  checkPrivilegesAsBoolean(
    user.ability,
    [
      { action: "view", subject: "User" },
      { action: "view", subject: "Privilege" },
    ],
    { logic: "all", redirect: true }
  );
  const formUser = await getUser(user.ability, id as string);

  const allPrivileges = (await getAllPrivileges(user.ability)).map(
    ({ id, name, descriptionFr, descriptionEn }) => ({
      id,
      name,
      descriptionFr,
      descriptionEn,
    })
  );

  return (
    <TwoColumnLayout
      user={user}
      context="admin"
      leftColumnContent={<BackToAccounts id={formUser.id} locale={locale} />}
    >
      <ManagePermissions {...{ formUser, allPrivileges }} />;
    </TwoColumnLayout>
  );
}

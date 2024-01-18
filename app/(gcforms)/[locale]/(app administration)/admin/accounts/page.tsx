import { serverTranslation } from "@i18n";
import { requireAuthentication } from "@lib/auth";
import { checkPrivilegesAsBoolean, getAllPrivileges } from "@lib/privileges";
import { getUsers } from "@lib/users";
import { AdminNavLayout } from "@serverComponents/globals/layouts";
import { Users } from "./clientSide";
import { Metadata } from "next";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("admin-users", { lang: locale });
  return {
    title: `${t("accounts")}`,
  };
}

export default async function Page({
  params: { locale },
  searchParams: { id: previousUserRef },
}: {
  params: { locale: string };
  searchParams: { id?: string };
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
  const allUsers = await getUsers(user.ability);

  const allPrivileges = (await getAllPrivileges(user.ability)).map(
    ({ id, name, descriptionFr, descriptionEn }) => ({
      id,
      name,
      descriptionFr,
      descriptionEn,
    })
  );

  // Convenience for features, lock/unlock publishing that may or may not have the related Id
  const publishFormsId = allPrivileges.find((privilege) => privilege.name === "PublishForms")?.id;

  // If the PublishForms privilege does not exist then we have a system wide issue
  if (!publishFormsId) {
    throw new Error("PublishForms privilege not found in global system privileges");
  }

  return (
    <AdminNavLayout locale={locale}>
      <Users {...{ allUsers, allPrivileges, publishFormsId, previousUserRef }} />
    </AdminNavLayout>
  );
}

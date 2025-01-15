import { serverTranslation } from "@i18n";
import { AuthenticatedPage } from "@lib/pages/auth";
import { authorization, getAllPrivileges } from "@lib/privileges";
import { getUser } from "@lib/users";
import { BackLink } from "@clientComponents/admin/LeftNav/BackLink";
import { Metadata } from "next";
import { PrivilegeList } from "./components/server/PrivilegeList";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("admin-users", { lang: locale });
  return {
    title: `${t("managePermissions")}`,
  };
}

export default AuthenticatedPage<{ id: string }>(
  [authorization.canViewAllUsers, authorization.canAccessPrivileges],
  async ({ params }) => {
    const { id, locale } = await params;

    const formUser = await getUser(id);

    const allPrivileges = (await getAllPrivileges()).map(
      ({ id, name, descriptionFr, descriptionEn }) => ({
        id,
        name,
        descriptionFr,
        descriptionEn,
      })
    );

    const canManageUsers = await authorization
      .canManageAllUsers()
      .then(() => true)
      .catch(() => false);

    const userPrivileges = allPrivileges.filter(
      (privilege) => privilege.name === "Base" || privilege.name === "PublishForms"
    );

    const accountPrivileges = allPrivileges.filter(
      (privilege) =>
        privilege.name === "ManageForms" ||
        privilege.name === "ViewUserPrivileges" ||
        privilege.name === "ManageUsers"
    );

    const systemPrivileges = allPrivileges.filter(
      (privilege) =>
        privilege.name === "ViewApplicationSettings" ||
        privilege.name === "ManageApplicationSettings"
    );

    const { t } = await serverTranslation("admin-users", { lang: locale });
    return (
      <>
        <BackLink href={`/${locale}/admin/accounts?id=${formUser.id}`}>
          {t("backToAccounts")}
        </BackLink>
        <h1 className="mb-6 flex flex-col gap-4 border-0">
          <div>
            <span className="block text-base">{formUser.name}</span>
            <span className="block text-base font-normal">{formUser.email}</span>
          </div>
          {t("managePermissions")}
        </h1>
        {/* Toast Message goes here */}
        <h2>{t("userAdministration")}</h2>
        <PrivilegeList
          formUser={formUser}
          privileges={userPrivileges}
          canManageUsers={canManageUsers}
        />
        <h2>{t("accountAdministration")}</h2>
        <PrivilegeList
          formUser={formUser}
          privileges={accountPrivileges}
          canManageUsers={canManageUsers}
        />
        <h2>{t("systemAdministration")}</h2>
        <PrivilegeList
          formUser={formUser}
          privileges={systemPrivileges}
          canManageUsers={canManageUsers}
        />
      </>
    );
  }
);

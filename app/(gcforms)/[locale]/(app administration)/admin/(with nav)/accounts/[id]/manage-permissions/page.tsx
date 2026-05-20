import { ViewTransition } from "react";
import { serverTranslation } from "@i18n";
import { AuthenticatedPage } from "@lib/pages/auth";
import { authorization, getAllPrivileges } from "@lib/privileges";
import { getUser } from "@lib/users";
import { BackLink } from "@clientComponents/admin/LeftNav/BackLink";
import { Metadata } from "next";
import { PrivilegeList } from "./components/server/PrivilegeList";
import { UserNameEmail } from "@formBuilder/components/shared/account/UserNameEmail";
import { buildAccountsSearchParams, parseAccountsSearchParams } from "../../lib/search";
import {
  accountsRouteTransition,
  getAccountIdentityTransitionName,
} from "../../lib/viewTransitions";

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
  async ({ params, searchParams }) => {
    const { id, locale } = await params;
    const resolvedSearchParams = await searchParams;

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
    const backToAccountsState = parseAccountsSearchParams(resolvedSearchParams);
    const backToAccountsParams = buildAccountsSearchParams(backToAccountsState);
    backToAccountsParams.set("focus", formUser.id);
    return (
      <ViewTransition {...accountsRouteTransition}>
        <BackLink
          href={`/${locale}/admin/accounts?${backToAccountsParams.toString()}`}
          transitionTypes={["nav-back"]}
        >
          {t("backToAccounts")}
        </BackLink>
        <h1 className="mb-6 flex flex-col gap-4 border-0">{t("managePermissions")}</h1>
        <div className="mb-12">
          <ViewTransition name={getAccountIdentityTransitionName(formUser.id)}>
            <UserNameEmail name={formUser.name || ""} email={formUser.email} />
          </ViewTransition>
        </div>
        {/* Toast Message goes here */}

        <div>
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
        </div>
      </ViewTransition>
    );
  }
);

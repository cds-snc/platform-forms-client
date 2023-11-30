import React, { ReactElement, useMemo, useState, useEffect } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { useAccessControl } from "@lib/hooks/useAccessControl";
import { useRouter } from "next/router";

import { requireAuthentication } from "@lib/auth";
import { checkPrivileges, getAllPrivileges } from "@lib/privileges";
import { logMessage } from "@lib/logger";
import { getUsers } from "@lib/users";
import AdminNavLayout from "@components/globals/layouts/AdminNavLayout";
import { Dropdown } from "@components/admin/Users/Dropdown";
import { ConfirmDeactivateModal } from "@components/admin/Users/ConfirmDeactivateModal";
import { RoundedButton, Button, themes, LinkButton } from "@components/globals";
import { DBUser } from "@lib/types/user-types";
import { Privilege } from "@prisma/client";
import { Card } from "@components/globals/card/Card";

const enum AccountsFilterState {
  ALL,
  ACTIVE,
  DEACTIVATED,
}

export const updateActiveStatus = async (userID: string, active: boolean) => {
  try {
    return await axios({
      url: `/api/users`,
      method: "PUT",
      data: {
        userID,
        active,
      },
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
    });
  } catch (e) {
    logMessage.error(e);
  }
};

const updatePrivilege = async (
  userID: string,
  privileges: { id: string; action: "add" | "remove" }[]
) => {
  try {
    return await axios({
      url: `/api/users`,
      method: "PUT",
      data: {
        userID,
        privileges,
      },
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
    });
  } catch (e) {
    logMessage.error(e);
  }
};

const Users = ({
  allUsers,
  publishFormsId,
  previousUserRef,
}: {
  allUsers: DBUser[];
  publishFormsId: string;
  previousUserRef?: string;
}): React.ReactElement => {
  const { t } = useTranslation("admin-users");
  const { ability } = useAccessControl();
  const canManageUsers = ability?.can("update", "User") ?? false;
  const { data: session } = useSession();
  const [selectedUser, setSelectedUser] = useState<DBUser | null>(null);
  const router = useRouter();
  const isCurrentUser = (user: DBUser) => {
    return user.id === session?.user?.id;
  };
  const [confirmDeleteModal, showConfirmDeleteModal] = useState(false);

  const [userList, setUserList] = useState(allUsers);

  const refreshUserData = async () => {
    try {
      const userListResponse = await axios({
        url: `/api/users`,
        method: "GET",
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });
      setUserList(userListResponse.data);
    } catch (e) {
      logMessage.error(e);
    }
  };

  const [accountsFilterState, setAccountsFilterState] = useState(AccountsFilterState.ALL);
  const updateAccountsFilter = (filter: AccountsFilterState) => {
    switch (filter) {
      case AccountsFilterState.ACTIVE:
        setAccountsFilterState(AccountsFilterState.ACTIVE);
        break;
      case AccountsFilterState.DEACTIVATED:
        setAccountsFilterState(AccountsFilterState.DEACTIVATED);
        break;
      default:
        setAccountsFilterState(AccountsFilterState.ALL);
    }
  };
  const isFilterAll = () => accountsFilterState === AccountsFilterState.ALL;
  const isFilterActive = () => accountsFilterState === AccountsFilterState.ACTIVE;
  const isFilterDeactivated = () => accountsFilterState === AccountsFilterState.DEACTIVATED;

  const accounts = useMemo(() => {
    return userList
      .sort((a, b) => (a.name && b.name ? a.name.localeCompare(b.name) : 0))
      .filter((user) => {
        if (accountsFilterState === AccountsFilterState.ACTIVE) return user?.active;
        if (accountsFilterState === AccountsFilterState.DEACTIVATED) return !user?.active;
        return user; // Defaults to filter All
      });
  }, [userList, accountsFilterState]);

  const hasPrivilege = ({
    privileges,
    privilegeName,
  }: {
    privileges: Privilege[];
    privilegeName: string;
  }): boolean => {
    return Boolean(privileges?.find((privilege) => privilege.name === privilegeName)?.id);
  };
  useEffect(() => {
    if (previousUserRef) {
      // if there is a user id in the query param, scroll to that user card
      const element = document.getElementById(`user-${previousUserRef}`);
      element?.scrollIntoView({ behavior: "smooth" });
      router.replace("/admin/accounts", undefined, { scroll: false });
    }
  }, [previousUserRef, router]);

  return (
    <>
      <Head>
        <title>{t("accounts")}</title>
      </Head>
      <>
        <h1 className="mb-0 border-0">{t("accounts")}</h1>
        <div className="mb-5">
          <ul
            id="accountsFilterList"
            className="flex list-none px-0 text-base"
            aria-label={t("accountsFilterLabel")}
          >
            <li className="mr-2 py-2 pt-3 text-sm tablet:mr-4">
              <RoundedButton
                theme={isFilterAll() ? "primary" : "secondary"}
                onClick={() => updateAccountsFilter(AccountsFilterState.ALL)}
              >
                {t("accountsFilter.all")}
              </RoundedButton>
            </li>
            <li className="mr-2 py-2 pt-3 text-sm tablet:mr-4">
              <RoundedButton
                theme={isFilterActive() ? "primary" : "secondary"}
                onClick={() => updateAccountsFilter(AccountsFilterState.ACTIVE)}
              >
                {t("accountsFilter.active")}
              </RoundedButton>
            </li>
            <li className="mr-2 py-2 pt-3 text-sm tablet:mr-4">
              <RoundedButton
                theme={isFilterDeactivated() ? "primary" : "secondary"}
                onClick={() => updateAccountsFilter(AccountsFilterState.DEACTIVATED)}
              >
                {t("accountsFilter.deactivated")}
              </RoundedButton>
            </li>
          </ul>
        </div>
        <div aria-live="polite">
          {accounts?.length > 0 && (
            <ul data-testid="accountsList" className="m-0 list-none p-0">
              {accounts.map((user) => {
                return (
                  <li
                    className="mb-4 flex max-w-2xl flex-row rounded-md border-2 border-black p-2"
                    id={`user-${user.id}`}
                    key={user.id}
                    data-testid={user.email}
                  >
                    <div className="m-auto grow basis-1/3 p-4">
                      <h2 className="pb-6 text-base">{user.name}</h2>
                      <p className="mb-4">{user.email}</p>

                      <div className="">
                        {canManageUsers && user.active && (
                          /* Lock / unlock publishing */
                          <Button
                            theme={"secondary"}
                            className="mr-2 tablet:mb-2"
                            onClick={async () => {
                              const action = hasPrivilege({
                                privileges: user.privileges,
                                privilegeName: "PublishForms",
                              })
                                ? "remove"
                                : "add";

                              await updatePrivilege(user.id, [{ id: publishFormsId, action }]);
                              await refreshUserData();
                            }}
                          >
                            {hasPrivilege({
                              privileges: user.privileges,
                              privilegeName: "PublishForms",
                            })
                              ? t("lockPublishing")
                              : t("unlockPublishing")}
                          </Button>
                        )}

                        {/* Manage Forms */}
                        {canManageUsers && user.active && (
                          <LinkButton.Secondary
                            scroll={false}
                            href={`/admin/accounts/${user.id}/manage-forms`}
                            className="mb-2 mr-2"
                          >
                            {t("manageForms")}
                          </LinkButton.Secondary>
                        )}

                        {/* Activate account */}
                        {canManageUsers && !isCurrentUser(user) && !user.active && (
                          <Button
                            theme={"secondary"}
                            className="mr-2"
                            onClick={async () => {
                              await updateActiveStatus(user.id, true);
                              await refreshUserData();
                            }}
                          >
                            {t("activateAccount")}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-end p-2" data-testid="managePermissionsDropdown">
                      {/* Manage Permissions  */}
                      {user.active && (
                        <Dropdown>
                          <DropdownMenuPrimitive.Item
                            className={`${themes.htmlLink} ${themes.base} !block !cursor-pointer`}
                            onClick={() => {
                              router.push({
                                pathname: `/admin/accounts/${user.id}/manage-permissions`,
                              });
                            }}
                          >
                            {canManageUsers ? t("managePermissions") : t("viewPermissions")}
                          </DropdownMenuPrimitive.Item>

                          {/* Deactivate Account  */}
                          {canManageUsers && !isCurrentUser(user) && user.active && (
                            <>
                              <DropdownMenuPrimitive.Item
                                className={`mt-2 w-full !block !cursor-pointer  ${themes.base} ${
                                  !user.active ? themes.secondary : themes.destructive
                                }`}
                                onClick={async () => {
                                  showConfirmDeleteModal(true);
                                  setSelectedUser(user);
                                }}
                              >
                                {user.active ? t("deactivateAccount") : t("activateAccount")}
                              </DropdownMenuPrimitive.Item>
                            </>
                          )}
                        </Dropdown>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {accounts?.length <= 0 && (
            <Card>
              <p className="text-[#748094]">
                {isFilterAll() && t("accountsFilter.noAccounts")}
                {isFilterActive() && t("accountsFilter.noActiveAccounts")}
                {isFilterDeactivated() && t("accountsFilter.noDeactivatedAccounts")}
              </p>
            </Card>
          )}
        </div>

        {confirmDeleteModal && selectedUser && (
          // Note: Placing this within the Dropdown will break it
          <ConfirmDeactivateModal
            user={selectedUser}
            handleClose={async () => {
              showConfirmDeleteModal(false);
              setSelectedUser(null);
              await refreshUserData();
            }}
          />
        )}
      </>
    </>
  );
};

Users.getLayout = (page: ReactElement) => {
  return <AdminNavLayout user={page.props.user}>{page}</AdminNavLayout>;
};

export const getServerSideProps = requireAuthentication(
  async ({ user: { ability }, locale, query }) => {
    checkPrivileges(
      ability,
      [
        { action: "view", subject: "User" },
        { action: "view", subject: "Privilege" },
      ],
      "all"
    );
    const allUsers = await getUsers(ability);

    const allPrivileges = (await getAllPrivileges(ability)).map(
      ({ id, name, descriptionFr, descriptionEn }) => ({
        id,
        name,
        descriptionFr,
        descriptionEn,
      })
    );

    // Convenience for features, lock/unlock publishing that may or may not have the related Id
    const publishFormsId = allPrivileges.find((privilege) => privilege.name === "PublishForms")?.id;

    const previousUserRef = query.id as string;

    return {
      props: {
        ...(locale &&
          (await serverSideTranslations(locale, ["common", "admin-users", "admin-login"]))),
        allUsers,
        allPrivileges,
        publishFormsId,
        ...(previousUserRef && { previousUserRef }),
      },
    };
  }
);

export default Users;

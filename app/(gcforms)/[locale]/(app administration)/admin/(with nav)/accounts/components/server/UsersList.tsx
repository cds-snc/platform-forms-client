import { UserCard } from "./UserCard";
import { authCheckAndThrow } from "@lib/actions";
import { serverTranslation } from "@i18n";
import { ScrollHelper } from "../client/ScrollHelper";
import { authorization, getPrivilege } from "@lib/privileges";
import { getUsersPage, type UserSearchProperty, type UserSearchState } from "@lib/users";
import { AccountsPagination } from "./AccountsPagination";
import { ACCOUNTS_PAGE_SIZE } from "../../lib/search";

export const UsersList = async ({
  page,
  query,
  property,
  userState,
  hasFilters,
}: {
  page: number;
  query: string;
  property: UserSearchProperty;
  userState?: UserSearchState;
  hasFilters: boolean;
}) => {
  const { ability } = await authCheckAndThrow();

  const canManageUser = await authorization
    .canManageAllUsers()
    .then(() => true)
    .catch(() => false);
  const canManageForms = await authorization
    .canManageAllForms()
    .then(() => true)
    .catch(() => false);

  const publishFormsId = await getPrivilege({ name: "PublishForms" }).then(
    (privilege) => privilege?.id
  );

  if (!publishFormsId) throw new Error("No publish forms privilege found in global privileges.");

  const { t } = await serverTranslation("admin-users");

  if (!hasFilters) {
    return (
      <div aria-live="polite">
        <p className="ml-4 text-lg font-semibold">{t("search.emptyState")}</p>
      </div>
    );
  }

  const usersPage = await getUsersPage({
    page,
    pageSize: ACCOUNTS_PAGE_SIZE,
    query,
    property,
    userState,
  });

  return (
    <div aria-live="polite">
      <ScrollHelper />

      {usersPage.totalCount > 0 ? (
        <>
          <AccountsPagination
            page={usersPage.page}
            pageSize={usersPage.pageSize}
            totalCount={usersPage.totalCount}
            totalPages={usersPage.totalPages}
            query={query}
            property={property}
            userState={userState}
          />
          <ul data-testid="accountsList" className="m-0 list-none p-0 pl-2">
            {usersPage.users.map((user) => {
              return (
                <li
                  className="mb-4 flex max-w-2xl flex-row rounded-md border-2 border-black p-2"
                  id={`user-${user.id}`}
                  key={user.id}
                  data-testid={user.email}
                >
                  <UserCard
                    user={user}
                    canManageUser={canManageUser}
                    canManageForms={canManageForms}
                    currentUserId={ability.user.id}
                    publishFormsId={publishFormsId}
                  />
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p data-id="results" className="ml-4 text-lg font-semibold">
          {query
            ? t("search.noResults")
            : userState === "active"
              ? t("accountsFilter.noActiveAccounts")
              : userState === "deactivated"
                ? t("accountsFilter.noDeactivatedAccounts")
                : t("accountsFilter.noAccounts")}
        </p>
      )}
    </div>
  );
};

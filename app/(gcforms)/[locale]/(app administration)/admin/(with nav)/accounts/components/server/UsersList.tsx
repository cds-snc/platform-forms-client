import { UserCard } from "./UserCard";
import { authCheckAndThrow } from "@lib/actions";
import { serverTranslation } from "@i18n";
import { ScrollHelper } from "../client/ScrollHelper";
import { UserSearch } from "../client/UserSearch";
import { authorization, getPrivilege } from "@lib/privileges";
import { getUsers } from "@lib/users";
import Fuse from "fuse.js";

export const UsersList = async ({ filter, query }: { filter?: string; query?: string }) => {
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

  // Fetch users with filter
  const users = await getUsers(filter ? { active: filter === "active" } : undefined);

  // Apply fuzzy search if query exists - we can fine tune these as needed
  let filteredUsers = users;
  if (query && query.trim() !== "") {
    const fuse = new Fuse(users, {
      keys: [
        { name: "name", weight: 2 },
        { name: "email", weight: 1.5 },
      ],
      threshold: 0.3, // Lower threshold for more accurate matches
      distance: 100, // Allow matching terms that are further apart
      ignoreLocation: true, // Match anywhere in the string
      minMatchCharLength: 2,
      shouldSort: true, // Sort results by score
      useExtendedSearch: true, // see: https://www.fusejs.io/examples.html#extended-search
    });

    filteredUsers = fuse.search(query).map((result) => result.item);
  }

  const { t } = await serverTranslation("admin-users");

  return (
    <div aria-live="polite">
      <ScrollHelper />
      <UserSearch />

      {filteredUsers?.length > 0 ? (
        <ul data-testid="accountsList" className="m-0 list-none p-0">
          {filteredUsers?.map((user) => {
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
      ) : (
        <p className="text-lg font-semibold">
          {query
            ? t("search.noResults")
            : filter === "active"
            ? t("accountsFilter.noActiveAccounts")
            : t("accountsFilter.noDeactivatedAccounts")}
        </p>
      )}
    </div>
  );
};

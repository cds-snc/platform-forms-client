import { createObjectCsvStringifier } from "@lib/responses/csv-writer";
import type { ExportableUser, UserSearchState } from "@lib/users";

const accountsCsvStringifier = createObjectCsvStringifier({
  header: [
    { id: "name", title: "name" },
    { id: "email", title: "email" },
    { id: "lastLogin", title: "lastLogin" },
  ],
});

const formatLastLogin = (value: Date | null) => value?.toISOString().slice(0, 10) ?? "";

export const buildAccountsCsv = (users: ExportableUser[]) => {
  return (
    "\uFEFF" +
    accountsCsvStringifier.getHeaderString() +
    accountsCsvStringifier.stringifyRecords(
      users.map((user) => ({
        name: user.name ?? "",
        email: user.email,
        lastLogin: formatLastLogin(user.lastLogin),
      }))
    )
  );
};

export const getAccountsCsvFileName = (userState: UserSearchState) => {
  return `accounts-${userState}.csv`;
};

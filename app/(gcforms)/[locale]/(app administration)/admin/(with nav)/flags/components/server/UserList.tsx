import { serverTranslation } from "@i18n";
import { featureFlagsGetAll } from "@lib/cache/userFeatureFlagsCache";
import { getUsers } from "@lib/users";
import { UserFlag } from "../client/UserFlag";
import { AddUserFlag } from "../client/AddUserFlag";

export const UserList = async () => {
  const { t } = await serverTranslation("admin-flags");

  const usersWithFlags = await featureFlagsGetAll();
  // Loop through the users and fetch their details
  const userIDs = usersWithFlags.map((uf) => uf.userID);
  const users = await getUsers({ id: { in: userIDs } });
  // Map user details back to the flags
  const usersWithDetails = usersWithFlags.map((uf) => {
    const user = users.find((u) => u.id === uf.userID);
    return {
      ...uf,
      userText: user ? `${user.name} (${user.email})` : uf.userID, // Display name and email if available
    };
  });

  return (
    <table className="mb-20 table-auto border-4">
      <thead>
        <tr>
          <th className="border-2 p-2">{t("User")}</th>
          <th className="border-2 p-2">{t("Flag")}</th>
          <th className="border-2 p-2">{t("Actions")}</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(usersWithDetails).map(([i, userflagData]) => (
          <UserFlag
            key={i}
            user={userflagData.userText}
            flag={userflagData.flag}
            userId={userflagData.userID}
          />
        ))}
        {usersWithDetails.length === 0 && (
          <tr>
            <td className="border-2 p-2" colSpan={3}>
              {t("No users have feature flags set.")}
            </td>
          </tr>
        )}
        <tr>
          <td className="border-2 p-2" colSpan={3}>
            <AddUserFlag />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

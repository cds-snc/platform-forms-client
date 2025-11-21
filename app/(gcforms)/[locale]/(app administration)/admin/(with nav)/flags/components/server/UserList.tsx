import { serverTranslation } from "@i18n";
import { UserFlag } from "../client/UserFlag";
import { AddUserFlag } from "../client/AddUserFlag";

export const UserList = async ({
  usersWithFeatures,
}: {
  usersWithFeatures: {
    userText: string;
    userId: string;
    feature: string;
  }[];
}) => {
  const { t } = await serverTranslation("admin-flags");

  return (
    <table className="mb-20 table-auto border-4">
      <thead>
        <tr>
          <th className="border-2 p-2">{t("user")}</th>
          <th className="border-2 p-2">{t("flag")}</th>
          <th className="border-2 p-2">{t("actions")}</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(usersWithFeatures).map(([i, userWithFeature]) => (
          <UserFlag
            key={i}
            user={userWithFeature.userText}
            flag={userWithFeature.feature}
            userId={userWithFeature.userId}
          />
        ))}
        {usersWithFeatures.length === 0 && (
          <tr>
            <td className="border-2 p-2" colSpan={3}>
              {t("noUserFlags")}
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

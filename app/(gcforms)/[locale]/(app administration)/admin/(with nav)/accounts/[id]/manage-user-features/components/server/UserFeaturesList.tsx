import { serverTranslation } from "@i18n";
import { AppUser } from "@lib/types/user-types";
import { featureFlagsCheck } from "@lib/cache/userFeatureFlagsCache";
import { RemoveFeatureButton } from "../client/RemoveFeatureButton";

export const UserFeaturesList = async ({ formUser }: { formUser: AppUser }) => {
  const { t } = await serverTranslation("admin-flags");

  const userFlags = await featureFlagsCheck(formUser.id);

  return (
    <table className="table-auto mb-4 mt-4 border-4">
      <thead>
        <tr>
          <th className="border-2 p-2">{t("Flag")}</th>
          <th className="border-2 p-2">{t("Actions")}</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(userFlags ?? {}).map(([flag, value]) => (
          <tr key={flag}>
            <td className="border-2 p-2">{value}</td>
            <td className="border-2 p-2">
              <RemoveFeatureButton formUser={formUser} flag={value} />
            </td>
          </tr>
        ))}
        {(userFlags?.length === 0 || !userFlags) && (
          <tr>
            <td className="border-2 p-2" colSpan={3}>
              {t("No flags are set for this user.")}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

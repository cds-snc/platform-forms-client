import { serverTranslation } from "@i18n";
import { checkAll } from "@lib/cache/flags";
import { Flag } from "../client/Flag";

export const FlagList = async () => {
  const { t } = await serverTranslation("admin-flags");
  const flags = await checkAll();
  return (
    <table className="table-auto border-4">
      <thead>
        <tr>
          <th className="border-2 p-2">{t("featureTitle")}</th>
          <th className="border-2 p-2">{t("featureStatus")}</th>
          <th className="border-2 p-2">{t("featureSwitch")}</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(flags).map(([key, value]) => (
          <Flag key={key} flagKey={key} value={value} />
        ))}
      </tbody>
    </table>
  );
};

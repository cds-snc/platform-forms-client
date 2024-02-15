"use client";
import { useTranslation } from "@i18n/client";
import { modifyFlag } from "./actions";
import { Button } from "@clientComponents/globals";

export const FlagTable = ({ flags }: { flags: Record<string, boolean> }) => {
  const { t } = useTranslation("admin-flags");

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
          <tr key={key} className="border-2">
            <td className="p-2">
              <p className="font-bold">{t(`features.${key}.title`)}</p>
              <p>{t(`features.${key}.description`)}</p>
            </td>
            <td className="p-2 border-2 border-dashed text-center">
              {value ? t("enabled") : t("disabled")}
            </td>
            <td className="p-2 text-center">
              <Button
                type="submit"
                theme="primary"
                className="text-sm whitespace-nowrap"
                onClick={async () => {
                  await modifyFlag(key, !value);
                }}
              >
                {value ? t("disable") : t("enable")}
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

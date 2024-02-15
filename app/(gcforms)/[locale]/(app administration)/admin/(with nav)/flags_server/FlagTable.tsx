"use client";
import { useState } from "react";
import { useTranslation } from "@i18n/client";
import { modifyFlag } from "./actions";
import { Button } from "@clientComponents/globals";

import { logMessage } from "@lib/logger";

export const FlagTable = ({ initialFlags }: { initialFlags: Record<string, boolean> }) => {
  const { t } = useTranslation("admin-flags");

  const [flags, setFlags] = useState(initialFlags);

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
                  const newFlags = await modifyFlag(key, !value);
                  logMessage.debug(`Flags:{${JSON.stringify(newFlags)}`);
                  setFlags(newFlags);
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

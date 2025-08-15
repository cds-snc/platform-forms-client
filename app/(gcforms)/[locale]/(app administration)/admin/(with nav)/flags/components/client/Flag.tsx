"use client";
import { modifyFlag } from "../../actions";
import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";

export const Flag = ({ flagKey, value }: { flagKey: string; value: boolean }) => {
  const { t } = useTranslation("admin-flags");
  const { update } = useFeatureFlags();

  return (
    <tr key={flagKey} className="border-2">
      <td className="p-2">
        <p className="font-bold">{t(`features.${flagKey}.title`)}</p>
        <p>{t(`features.${flagKey}.description`)}</p>
      </td>
      <td className="border-2 border-dashed p-2 text-center">
        {value ? t("enabled") : t("disabled")}
      </td>
      <td className="p-2 text-center">
        <Button
          type="submit"
          theme="primary"
          className="whitespace-nowrap text-sm"
          onClick={async () => {
            await modifyFlag(flagKey, !value);
            await update();
          }}
        >
          {value ? t("disable") : t("enable")}
        </Button>
      </td>
    </tr>
  );
};

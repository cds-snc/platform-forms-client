import { useTranslation } from "@i18n/client";
import { ApiTooltip } from "./ApiTooltip";

export const KeyId = ({ keyId }: { keyId: string }) => {
  const { t } = useTranslation("form-builder");
  return (
    <div className="mb-4">
      <span className="font-bold">{t("settings.api.keyId")}</span>
      <ApiTooltip />
      <span>{keyId}</span>
    </div>
  );
};

import { Tooltip } from "@formBuilder/components/shared/Tooltip";
import { useTranslation } from "@i18n/client";

export const ApiTooltip = () => {
  const { t } = useTranslation("form-builder");
  return (
    <Tooltip.Info
      side="top"
      triggerClassName="align-middle ml-1"
      tooltipClassName="font-normal whitespace-normal"
      label={t("settings.api.keyIdToolTip.text1")}
    >
      <strong>{t("settings.api.keyIdToolTip.text1")}</strong>
      <p>{t("settings.api.keyIdToolTip.text2")}</p>
    </Tooltip.Info>
  );
};

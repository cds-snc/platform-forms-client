import { Tooltip } from "@formBuilder/components/shared/Tooltip";
import { useTranslation } from "@i18n/client";
import Markdown from "markdown-to-jsx";

export const KeyboardNavTip = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div className="flex items-center text-sm">
      <label className="ml-4 flex font-bold">
        {t("groups.treeView.keyboardNav.label")}
        <Tooltip.Info
          side="left"
          triggerClassName="align-middle ml-1"
          tooltipClassName="font-normal whitespace-normal"
        >
          <Markdown options={{ forceBlock: true }}>
            {t("groups.treeView.keyboardNav.body")}
          </Markdown>
        </Tooltip.Info>
      </label>
    </div>
  );
};

import { Tooltip } from "@formBuilder/components/shared/Tooltip";
import { useTranslation } from "@i18n/client";
import Markdown from "markdown-to-jsx";
import { HelpIcon } from "@serverComponents/icons";

export const KeyboardNavTip = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div className="flex items-center text-sm">
      <label className="ml-4 flex text-sm">
        <Tooltip.CustomTrigger
          side="left"
          trigger={
            <button className="mr-4">
              <span className="mr-2 inline-block hover:underline">
                {t("groups.treeView.keyboardNav.label")}
              </span>
              <HelpIcon className="inline-block" />
            </button>
          }
          triggerClassName="align-middle ml-1"
          tooltipClassName="font-normal whitespace-normal"
        >
          <Markdown options={{ forceBlock: true }}>
            {t("groups.treeView.keyboardNav.body")}
          </Markdown>
        </Tooltip.CustomTrigger>
      </label>
    </div>
  );
};

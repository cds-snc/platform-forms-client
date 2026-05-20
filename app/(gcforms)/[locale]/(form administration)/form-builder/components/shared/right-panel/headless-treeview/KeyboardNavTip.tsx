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
          side="bottom"
          align="end"
          sideOffset={4}
          trigger={
            <button className="mr-4">
              <span className="mr-2 inline-block hover:underline">
                {t("groups.treeView.keyboardNav.label")}
              </span>
              <HelpIcon className="inline-block" />
            </button>
          }
          triggerClassName="align-middle ml-1"
          tooltipClassName="max-w-72 font-normal whitespace-normal"
        >
          <Markdown options={{ forceBlock: true }}>
            {t("groups.treeView.keyboardNav.body")}
          </Markdown>
        </Tooltip.CustomTrigger>
      </label>
    </div>
  );
};

import { useTranslation } from "@i18n/client";
import Markdown from "markdown-to-jsx";
import { HelpIcon } from "@serverComponents/icons";

export const KeyboardNavTip = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div className="flex items-center text-sm">
      <div className="group relative ml-4 flex text-sm">
        <button
          type="button"
          className="mr-4 inline-flex items-center"
          aria-describedby="keyboard-nav-tip"
        >
          <span className="mr-2 inline-block group-focus-within:underline group-hover:underline">
            {t("groups.treeView.keyboardNav.label")}
          </span>
          <HelpIcon className="inline-block" />
        </button>
        <div
          id="keyboard-nav-tip"
          role="tooltip"
          className="pointer-events-none absolute top-full right-0 z-20 mt-2 hidden! w-72 rounded-md border border-violet-400 bg-violet-100 p-4 font-normal whitespace-normal group-focus-within:block! group-hover:block!"
        >
          <Markdown options={{ forceBlock: true }}>
            {t("groups.treeView.keyboardNav.body")}
          </Markdown>
        </div>
      </div>
    </div>
  );
};

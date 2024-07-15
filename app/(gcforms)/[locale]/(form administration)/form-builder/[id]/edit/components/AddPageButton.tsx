import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { useTreeRef } from "@formBuilder/components/shared/right-panel/treeview/provider/TreeRefProvider";
import { NewPageIcon } from "@serverComponents/icons/NewPageIcon";
import { cn } from "@lib/utils";

export const AddPageButton = ({ className }: { className?: string }) => {
  const { treeView, togglePanel } = useTreeRef();
  const { t } = useTranslation("form-builder");

  return (
    <Button
      theme="secondary"
      className={cn(
        "group/button !border-1.5 border-slate-500 bg-gray-soft !px-4 !py-2 text-sm leading-6 text-indigo-700 hover:bg-gray-200 hover:text-indigo-800",
        className
      )}
      onClick={() => {
        togglePanel && togglePanel(true);

        // add 1 sec delay to allow the panel to open
        setTimeout(() => {
          treeView?.current?.addPage();
        }, 500);
      }}
    >
      <>
        <NewPageIcon className="mr-2 inline-block fill-indigo-500 group-hover/button:fill-indigo-600 group-focus/button:fill-white" />
        <span className="inline-block">{t("groups.addNewPage")}</span>
      </>
    </Button>
  );
};

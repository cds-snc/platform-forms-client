import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { NewPageIcon } from "@serverComponents/icons/NewPageIcon";
import { cn } from "@lib/utils";
import { useTreeRef } from "@formBuilder/components/shared/right-panel/headless-treeview/provider/TreeRefProvider";
import { useGroupStore } from "@root/lib/groups/useGroupStore";
import { useCallback } from "react";

export const AddPageButton = ({ className }: { className?: string }) => {
  const { togglePanel, startRenamingNewGroup, open: panelOpen } = useTreeRef();
  const { t } = useTranslation("form-builder");
  const newSectionText = t("groups.newPage");

  const { setId, addGroup } = useGroupStore((s) => ({
    setId: s.setId,
    addGroup: s.addGroup,
  }));

  // Keep track of groups changes to trigger sync
  const addPage = useCallback(() => {
    const id = addGroup(newSectionText);

    setId(id);

    startRenamingNewGroup && startRenamingNewGroup(id);

    return id;
  }, [addGroup, newSectionText, setId, startRenamingNewGroup]);

  return (
    <Button
      theme="secondary"
      className={cn(
        "group/button !border-1.5 border-slate-500 bg-gray-soft !px-4 !py-2 text-sm leading-6 text-indigo-700 hover:bg-gray-200 hover:text-indigo-800",
        className
      )}
      onClick={() => {
        if (panelOpen) {
          addPage();
          return;
        }

        togglePanel && togglePanel(true);

        setTimeout(() => {
          addPage();
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

"use client";
import { LangSwitcher } from "@formBuilder/components/shared/LangSwitcher";
import { toast } from "@formBuilder/components/shared/Toast";
import { Tooltip } from "@formBuilder/components/shared/Tooltip";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { autoSetNextAction } from "@formBuilder/components/shared/right-panel/treeview/util/setNextAction";
import { GroupsType } from "@lib/formContext";
import { SortIcon } from "@serverComponents/icons";

export const LogicNavigation = () => {
  const { getGroups, replaceGroups } = useGroupStore((s) => {
    return {
      getGroups: s.getGroups,
      replaceGroups: s.replaceGroups,
    };
  });

  const autoFlow = () => {
    const groups = getGroups() as GroupsType;
    const newGroups = autoSetNextAction({ ...groups }, true); // forces overwrite of existing next actions
    replaceGroups(newGroups);
    toast.success("Auto flow applied");
  };

  return (
    <div className="flex gap-4">
      <LangSwitcher descriptionLangKey="editingIn" />
      <div className="flex items-baseline text-sm">
        <label>
          Auto flow
          <button className="ml-2 mt-2 rounded-md border border-slate-500 p-1" onClick={autoFlow}>
            <SortIcon title="Auto flow" />
          </button>
          <Tooltip.Info
            side="top"
            triggerClassName="align-middle ml-1"
            tooltipClassName="font-normal whitespace-normal"
          >
            <strong>Auto flow</strong>
            <p>
              Auto flow will automatically set a linear flow for your sections, overriding any
              existing rules.
            </p>
          </Tooltip.Info>
        </label>
      </div>
    </div>
  );
};

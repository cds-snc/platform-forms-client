"use client";
import { LangSwitcher } from "@formBuilder/components/shared/LangSwitcher";
import { toast } from "@formBuilder/components/shared/Toast";
import { Tooltip } from "@formBuilder/components/shared/Tooltip";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { autoFlowAllNextActions } from "@formBuilder/components/shared/right-panel/treeview/util/setNextAction";
import { GroupsType } from "@lib/formContext";
import { SortIcon } from "@serverComponents/icons";
import { useTranslation } from "@i18n/client";
import { useFlowRef } from "@formBuilder/[id]/edit/logic/components/flow/provider/FlowRefProvider";
import { resetLockedSections } from "@lib/formContext";

export const LogicNavigation = () => {
  const { t } = useTranslation("form-builder");
  const { getGroups, replaceGroups } = useGroupStore((s) => {
    return {
      getGroups: s.getGroups,
      replaceGroups: s.replaceGroups,
    };
  });

  const { flow } = useFlowRef();

  const autoFlow = () => {
    const groups = getGroups() as GroupsType;
    let newGroups = autoFlowAllNextActions({ ...groups }, true); // forces overwrite of existing next actions

    if (newGroups) {
      newGroups = resetLockedSections(newGroups);
    }

    replaceGroups(newGroups);
    flow.current?.redraw();
    toast.success(t("logic.toastSuccess"));
  };

  return (
    <div className="flex gap-4">
      <LangSwitcher descriptionLangKey="editingIn" />
      <div className="flex items-center text-sm">
        <label className="ml-4 flex font-bold">
          {t("logic.resetRules")}
          <button className="ml-2 rounded-md border border-slate-500" onClick={autoFlow}>
            <SortIcon title={t("logic.resetRules")} />
          </button>
          <Tooltip.Info
            side="top"
            triggerClassName="align-middle ml-1"
            tooltipClassName="font-normal whitespace-normal"
            iconTitle={t("logic.resetRulesHelp")}
          >
            <strong>{t("logic.resetRules")}</strong>
            <p>{t("logic.resetRulesDescription")}</p>
          </Tooltip.Info>
        </label>
      </div>
    </div>
  );
};

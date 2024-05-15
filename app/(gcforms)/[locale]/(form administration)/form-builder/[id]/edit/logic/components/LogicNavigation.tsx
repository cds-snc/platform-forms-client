"use client";
import { LangSwitcher } from "@formBuilder/components/shared/LangSwitcher";
import { toast } from "@formBuilder/components/shared/Toast";
import { Tooltip } from "@formBuilder/components/shared/Tooltip";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { autoSetNextAction } from "@formBuilder/components/shared/right-panel/treeview/util/setNextAction";
import { GroupsType } from "@lib/formContext";
import { SortIcon } from "@serverComponents/icons";
import { useTranslation } from "@i18n/client";

export const LogicNavigation = () => {
  const { t } = useTranslation("form-builder");
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
          >
            <strong>{t("logic.resetRules")}</strong>
            <p>{t("logic.resetRulesDescription")}</p>
          </Tooltip.Info>
        </label>
      </div>
    </div>
  );
};

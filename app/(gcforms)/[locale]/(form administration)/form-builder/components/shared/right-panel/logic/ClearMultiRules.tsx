import { Button } from "@clientComponents/globals";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { useTranslation } from "@i18n/client";

export const ClearMultiRules = () => {
  const setGroupNextAction = useGroupStore((state) => state.setGroupNextAction);
  const selectedGroupId = useGroupStore((state) => state.id);
  const { t } = useTranslation("form-builder");
  return (
    <div>
      <p className="text-sm">{t("logic.multiRulesWarning")}</p>
      <Button
        className="my-4 px-4 py-2"
        onClick={() => {
          setGroupNextAction(selectedGroupId, []);
        }}
      >
        {t("logic.clear")}
      </Button>
    </div>
  );
};

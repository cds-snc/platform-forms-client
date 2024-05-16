import { Button } from "@clientComponents/globals";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { useTranslation } from "@i18n/client";

export const ClearMultiRules = () => {
  const setGroupNextAction = useGroupStore((state) => state.setGroupNextAction);
  const selectedGroupId = useGroupStore((state) => state.id);
  const { t } = useTranslation("form-builder");
  return (
    <div className="border-b-2 border-black bg-slate-50">
      <div className="max-w-[375px] p-4">
        <p className="mb-4 mt-2 text-sm font-bold">{t("logic.multiRulesWarning.text1")}</p>
        <p className="mb-4 text-sm">
          <span className="font-bold">{t("logic.multiRulesWarning.text2")}</span>{" "}
          {t("logic.multiRulesWarning.text3")}
        </p>
        <Button
          className="my-4 px-4 py-1"
          onClick={() => {
            setGroupNextAction(selectedGroupId, []);
          }}
        >
          {t("logic.clear")}
        </Button>
      </div>
    </div>
  );
};

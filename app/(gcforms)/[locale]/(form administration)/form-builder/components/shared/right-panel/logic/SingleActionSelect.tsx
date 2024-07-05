import React, { useState } from "react";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { GroupsType } from "@lib/formContext";
import { GroupSelect } from "./GroupSelect";
import { Button } from "@clientComponents/globals";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { useFlowRef } from "@formBuilder/[id]/edit/logic/components/flow/provider/FlowRefProvider";
import { FormElement } from "@lib/types";
import { useTranslation } from "@i18n/client";
import { SaveNote } from "./SaveNote";
import { toast } from "@formBuilder/components/shared/Toast";
import { Checkbox } from "@formBuilder/components/shared";

export const SingleActionSelect = ({
  item,
  nextAction = "review",
}: {
  item?: FormElement | null;
  nextAction: string | undefined;
}) => {
  const { flow } = useFlowRef();
  const id = useGroupStore((state) => state.id);
  const findParentGroup = useGroupStore((state) => state.findParentGroup);
  const setGroupNextAction = useGroupStore((state) => state.setGroupNextAction);
  const { t } = useTranslation("form-builder");

  const currentGroup = id;
  const [nextActionId, setNextActionId] = useState(nextAction);

  const formGroups: GroupsType = useTemplateStore((s) => s.form.groups) || {};
  let groupItems = Object.keys(formGroups).map((key) => {
    const item = formGroups[key];
    return { label: item.name, value: key };
  });

  // Filter out the current group
  groupItems = groupItems.filter((item) => item.value !== currentGroup && item.value !== "end");

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setNextActionId(value);
  };

  const isExitAction = nextActionId === "exit";

  const exitLabelId = `section-select-check-${currentGroup}-${isExitAction}`;

  if (nextAction === "exit") {
    return (
      <div>
        <div className="p-4">
          <h4 className="mb-4 block text-sm font-bold">
            {t("logic.exit.exitPanel.title1")}:
            <span className="ml-2 font-normal">{t("logic.exit.exitPanel.title2")}</span>
          </h4>
          <p className="mb-4 text-sm italic">{t("logic.exit.exitPanel.description")}</p>
          <Button theme="secondary">{t("logic.exit.exitPanel.buttonLabel")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <GroupSelect selected={nextActionId} groups={groupItems} onChange={handleGroupChange} />
        {/*  Add section Exit checkbox */}
        {currentGroup !== "start" ? (
          <div className="gc-right-panel">
            <p className="mb-2 block text-sm">{t("logic.exit.convertText")}</p>
            <Checkbox
              id={exitLabelId}
              value="exit"
              defaultChecked={isExitAction}
              key={`${exitLabelId}-${nextActionId}`}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                e.target.checked ? setNextActionId("exit") : setNextActionId("review");
              }}
              checkboxClassName="mr-2 cursor-pointer"
              labelClassName="cursor-pointer"
              label={t("logic.exit.checkboxLabel")}
            ></Checkbox>
          </div>
        ) : null}
      </div>
      <div>
        <SaveNote />
        <Button
          className="ml-0 px-4 py-1"
          onClick={() => {
            if (item) {
              const group = findParentGroup(String(item.id));
              const parent = group?.index;
              parent && setGroupNextAction(parent as string, nextActionId);
            } else {
              currentGroup && setGroupNextAction(currentGroup, nextActionId);
            }

            flow.current?.redraw();

            toast.success(t("logic.actionsSaved"));
          }}
        >
          {t("logic.saveRule")}
        </Button>
      </div>
    </div>
  );
};

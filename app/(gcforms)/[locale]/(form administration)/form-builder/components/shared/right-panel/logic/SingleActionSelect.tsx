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

const ExitIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
      <path
        d="M2 18.3244C1.45 18.3244 0.979167 18.1286 0.5875 17.7369C0.195833 17.3453 0 16.8744 0 16.3244V12.3244H2V16.3244H16V2.32443H2V6.32443H0V2.32443C0 1.77443 0.195833 1.3036 0.5875 0.911932C0.979167 0.520266 1.45 0.324432 2 0.324432H16C16.55 0.324432 17.0208 0.520266 17.4125 0.911932C17.8042 1.3036 18 1.77443 18 2.32443V16.3244C18 16.8744 17.8042 17.3453 17.4125 17.7369C17.0208 18.1286 16.55 18.3244 16 18.3244H2ZM7.5 14.3244L6.1 12.8744L8.65 10.3244H0V8.32443H8.65L6.1 5.77443L7.5 4.32443L12.5 9.32443L7.5 14.3244Z"
        fill="#1E293B"
      />
    </svg>
  );
};

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
          <h4 className="relative mb-4 block text-sm font-bold">
            <span className="absolute top-[4px] inline-block">
              <ExitIcon />
            </span>
            <span className="ml-6 mr-3 inline-block">{t("logic.exit.exitPanel.title1")}:</span>
            <span className="inline-block font-normal">{t("logic.exit.exitPanel.title2")}</span>
          </h4>
          <p className="mb-4 text-sm italic">{t("logic.exit.exitPanel.description")}</p>
          <Button
            onClick={() => {
              currentGroup && setGroupNextAction(currentGroup, "review");
              toast.success(t("logic.actionsSaved"));
            }}
            theme="secondary"
          >
            {t("logic.exit.exitPanel.buttonLabel")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <GroupSelect selected={nextActionId} groups={groupItems} onChange={handleGroupChange} />
        {/*  Add section Exit checkbox option */}
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

            // Add a delay to allow group state to update calling for redraw
            setTimeout(() => {
              flow.current?.redraw();
            }, 200);

            toast.success(t("logic.actionsSaved"));
          }}
        >
          {t("logic.saveRule")}
        </Button>
      </div>
    </div>
  );
};

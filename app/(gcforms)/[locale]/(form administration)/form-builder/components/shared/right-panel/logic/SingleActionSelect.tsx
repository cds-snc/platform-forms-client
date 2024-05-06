import React, { useState } from "react";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { GroupsType } from "@lib/formContext";
import { GroupSelect } from "./GroupSelect";
import { Button } from "@clientComponents/globals";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { useFlowRef } from "@formBuilder/[id]/edit/logic/components/flow/provider/FlowRefProvider";
import { FormElement } from "@lib/types";

export const SingleActionSelect = ({
  item,
  nextAction = "end",
}: {
  item?: FormElement | null;
  nextAction: string | undefined;
}) => {
  const { flow } = useFlowRef();
  const id = useGroupStore((state) => state.id);
  const findParentGroup = useGroupStore((state) => state.findParentGroup);
  const setGroupNextAction = useGroupStore((state) => state.setGroupNextAction);

  const currentGroup = id;
  const [nextActionId, setNextActionId] = useState(nextAction);

  const formGroups: GroupsType = useTemplateStore((s) => s.form.groups) || {};
  let groupItems = Object.keys(formGroups).map((key) => {
    const item = formGroups[key];
    return { label: item.name, value: key };
  });

  // Filter out the current group
  groupItems = groupItems.filter((item) => item.value !== currentGroup);

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setNextActionId(value);
  };

  return (
    <div>
      <div className="mb-4">
        <GroupSelect selected={nextActionId} groups={groupItems} onChange={handleGroupChange} />
      </div>
      <div>
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

            flow.current?.updateEdges();
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

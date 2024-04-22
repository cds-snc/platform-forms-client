import React, { useState } from "react";
import { FormElement } from "@lib/types";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { GroupsType } from "@lib/formContext";
import { GroupSelect } from "./GroupSelect";
import { Button } from "@clientComponents/globals";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";

export const SingleActionSelect = ({
  item,
  nextAction = "end",
}: {
  item: FormElement;
  nextAction: string | undefined;
}) => {
  const getId = useGroupStore((state) => state.getId);
  const findParentGroup = useGroupStore((state) => state.findParentGroup);
  const setGroupNextAction = useGroupStore((state) => state.setGroupNextAction);

  const currentGroup = getId();
  const [nextActionId, setNextActionId] = useState(nextAction);

  const formGroups: GroupsType = useTemplateStore((s) => s.form.groups) || {};
  let groupItems = Object.keys(formGroups).map((key) => {
    const item = formGroups[key];
    return { label: item.name, value: key };
  });

  groupItems.push({ label: "End", value: "end" });

  groupItems = groupItems.filter((group) => group.value !== currentGroup);

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setNextActionId(value);
  };

  return (
    <div>
      <div>
        <div>
          <div className="mb-4">
            <GroupSelect selected={nextActionId} groups={groupItems} onChange={handleGroupChange} />
          </div>
          <div>
            <Button
              className="ml-4"
              onClick={() => {
                const group = findParentGroup(String(item.id));
                const parent = group?.index;
                parent && setGroupNextAction(parent as string, nextActionId);
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

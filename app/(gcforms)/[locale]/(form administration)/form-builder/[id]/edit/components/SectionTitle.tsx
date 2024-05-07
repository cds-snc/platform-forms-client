import { useTreeRef } from "@formBuilder/components/shared/right-panel/treeview/provider/TreeRefProvider";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { LockedSections } from "@formBuilder/components/shared/right-panel/treeview/types";
import { useEffect, useRef, useState } from "react";

export const SectionTitle = ({ groupName, groupId }: { groupName: string; groupId: string }) => {
  const [editing, setEditing] = useState(false);
  const groupNameRef = useRef<HTMLHeadingElement>(null);
  const { treeView } = useTreeRef();
  const updateGroupName = useGroupStore((state) => state.updateGroupName);

  const handleOnBlur = (e: React.FocusEvent) => {
    saveGroupName(e.currentTarget.textContent || "");
  };

  const handleOnKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveGroupName(e.currentTarget.textContent || "");
    }
  };

  const saveGroupName = (groupName: string) => {
    updateGroupName({ id: groupId, name: groupName });
    setEditing(false);
    treeView?.current?.updateItem(groupId, groupName);
  };

  useEffect(() => {
    if (editing && groupNameRef.current) {
      groupNameRef.current.focus();
    }
  }, [editing]);

  return (
    <h4
      ref={groupNameRef}
      onDoubleClick={(e) => {
        if (Object.values(LockedSections).includes(groupId as LockedSections)) return;

        setEditing(true);
        e.currentTarget.focus();
      }}
      suppressContentEditableWarning={true}
      contentEditable={editing}
      onBlur={handleOnBlur}
      onKeyUp={handleOnKeyUp}
    >
      {groupName}
    </h4>
  );
};

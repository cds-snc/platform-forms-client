import React, { useRef } from "react";
import { useTreeRef } from "@formBuilder/components/shared/right-panel/treeview/provider/TreeRefProvider";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { ExpandingInput } from "@formBuilder/components/shared";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { LockedSections } from "@formBuilder/components/shared/right-panel/treeview/types";

export const SectionTitle = ({ groupName, groupId }: { groupName: string; groupId: string }) => {
  const { getLocalizationAttribute } = useTemplateStore((s) => ({
    getLocalizationAttribute: s.getLocalizationAttribute,
  }));

  const groupNameRef = useRef(null);
  const { treeView } = useTreeRef();
  const updateGroupName = useGroupStore((state) => state.updateGroupName);

  const handleOnBlur = (e: React.FocusEvent) => {
    saveGroupName(e.currentTarget.textContent || "");
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    saveGroupName(e.target.value || "");
  };

  const saveGroupName = (groupName: string) => {
    updateGroupName({ id: groupId, name: groupName });
    treeView?.current?.updateItem(groupId, groupName);
  };

  const lockedInput = Object.values(LockedSections).includes(groupId as LockedSections);

  return lockedInput ? (
    <h4 className="font-bold laptop:text-3xl">{groupName}</h4>
  ) : (
    <ExpandingInput
      id="sectionTitle"
      ref={groupNameRef}
      wrapperClassName="w-full mr-5 mt-2 laptop:mt-0 font-bold laptop:text-3xl"
      className="font-bold placeholder:text-slate-500 laptop:text-3xl"
      placeholder={"SectionTitle"}
      value={groupName}
      onBlur={handleOnBlur}
      onChange={handleChange}
      {...getLocalizationAttribute()}
    />
  );
};

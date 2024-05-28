import React, { useRef } from "react";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { ExpandingInput } from "@formBuilder/components/shared";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { LockedSections } from "@formBuilder/components/shared/right-panel/treeview/types";
import { Language } from "@lib/types/form-builder-types";

export const SectionTitle = ({ groupTitle, groupId }: { groupTitle: string; groupId: string }) => {
  const { getLocalizationAttribute } = useTemplateStore((s) => ({
    getLocalizationAttribute: s.getLocalizationAttribute,
  }));
  const language = getLocalizationAttribute()?.lang as Language;

  const groupNameRef = useRef(null);
  const updateGroupTitle = useGroupStore((state) => state.updateGroupTitle);

  const handleOnBlur = (e: React.FocusEvent) => {
    saveGroupTitle(e.currentTarget.textContent || "");
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    saveGroupTitle(e.target.value || "");
  };

  const saveGroupTitle = (groupTitle: string) => {
    updateGroupTitle({ id: groupId, locale: language || "en", title: groupTitle });
  };

  const lockedInput = Object.values(LockedSections).includes(groupId as LockedSections);

  return lockedInput ? (
    <h4 className="font-bold laptop:text-3xl">{groupTitle}</h4>
  ) : (
    <ExpandingInput
      id="sectionTitle"
      ref={groupNameRef}
      wrapperClassName="w-full mr-5 mt-2 laptop:mt-0 font-bold laptop:text-3xl"
      className="font-bold placeholder:text-slate-500 laptop:text-3xl"
      placeholder={"SectionTitle"}
      value={groupTitle}
      onBlur={handleOnBlur}
      onChange={handleChange}
      {...getLocalizationAttribute()}
    />
  );
};

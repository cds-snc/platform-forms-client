import React, { useRef } from "react";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { ExpandingInput } from "@formBuilder/components/shared/ExpandingInput";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { LockedSections } from "@formBuilder/components/shared/right-panel/treeview/types";
import { Language } from "@lib/types/form-builder-types";
import { useTranslation } from "@i18n/client";
import { useTreeRef } from "@formBuilder/components/shared/right-panel/treeview/provider/TreeRefProvider";

export const SectionTitle = ({ groupTitle, groupId }: { groupTitle: string; groupId: string }) => {
  const { getLocalizationAttribute, translationLanguagePriority } = useTemplateStore((s) => ({
    getLocalizationAttribute: s.getLocalizationAttribute,
    translationLanguagePriority: s.translationLanguagePriority,
  }));
  // Defaulting to form language to handle case of getLocalizationAttribute returning undefined and
  // defaulting to English. Instead we want e.g. French when French page + French form. See #4040
  const language = (getLocalizationAttribute()?.lang as Language) || translationLanguagePriority;

  const { t } = useTranslation("form-builder");
  const { tree } = useTreeRef();

  const groupNameRef = useRef(null);
  const updateGroupTitle = useGroupStore((state) => state.updateGroupTitle);

  const handleOnBlur = (e: React.FocusEvent) => {
    saveGroupTitle(e.currentTarget.textContent || "");
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    saveGroupTitle(e.target.value || "");
  };

  const saveGroupTitle = (groupTitle: string) => {
    updateGroupTitle({ id: groupId, locale: language, title: groupTitle });

    const sectionTitleKey = `section-title-${groupId}`;
    tree?.current?.renameItem(sectionTitleKey, groupTitle);
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
      placeholder={t("groups.pageTitle")}
      value={groupTitle}
      onBlur={handleOnBlur}
      onChange={handleChange}
      {...getLocalizationAttribute()}
      ariaLabel={t("groups.pageTitle")}
    />
  );
};

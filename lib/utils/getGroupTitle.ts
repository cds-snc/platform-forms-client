import { type GroupsType } from "@gcforms/types";
import { getLocalizedProperty, LocalizedElementProperties, Language } from "@root/lib/utils";

export type GroupTitleProps = {
  groups: GroupsType;
  groupId: string | null;
  language: Language;
};

export const getGroupTitle = ({ groups, groupId, language }: GroupTitleProps) => {
  if (!groupId) return "";
  return (
    groups?.[groupId]?.[getLocalizedProperty(LocalizedElementProperties.TITLE, language)] || ""
  );
};

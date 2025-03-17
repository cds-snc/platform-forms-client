import { type GroupsType } from "@lib/formContext";
import { getProperty } from "@lib/i18nHelpers";
import { type Language } from "@lib/types/form-builder-types";

export type GroupTitleProps = {
  groups: GroupsType;
  groupId: string | null;
  language: Language;
};

export const getGroupTitle = ({ groups, groupId, language }: GroupTitleProps) => {
  if (!groupId) return "";
  const titleLanguageKey = getProperty("title", language) as "titleEn" | "titleFr";
  return groups?.[groupId]?.[titleLanguageKey] || "";
};

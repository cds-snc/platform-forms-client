import { useTemplateStore } from "@lib/store/useTemplateStore";
import { LocalizedElementProperties } from "@lib/types/form-builder-types";

export const useLocalize = () => {
  const { translationLanguagePriority, localizeField } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const localizedTitle = localizeField(
    LocalizedElementProperties.TITLE,
    translationLanguagePriority
  );

  const localizedDescription = localizeField(
    LocalizedElementProperties.DESCRIPTION,
    translationLanguagePriority
  );

  return { localizedTitle, localizedDescription };
};

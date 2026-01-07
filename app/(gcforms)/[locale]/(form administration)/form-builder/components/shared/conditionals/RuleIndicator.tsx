import { useTemplateStore } from "@lib/store/useTemplateStore";
import { LocalizedFormProperties } from "@lib/types/form-builder-types";
import { ConditionalIcon } from "@serverComponents/icons/ConditionalIcon";
import { removeMarkdown } from "@lib/groups/utils/itemType";

export const RuleIndicator = ({ choiceId }: { choiceId: string }) => {
  "use memo";

  const { getChoice, getFormElementById, localizeField, translationLanguagePriority } =
    useTemplateStore((s) => ({
      getChoice: s.getChoice,
      getFormElementById: s.getFormElementById,
      localizeField: s.localizeField,
      translationLanguagePriority: s.translationLanguagePriority,
    }));

  const parentId = Number(choiceId.split(".")[0]);
  const childId = Number(choiceId.split(".")[1]);
  const element = getFormElementById(parentId);
  const choice = getChoice(parentId, childId);

  if (!element || !choice) return null;

  const titleKey = localizeField(LocalizedFormProperties.TITLE, translationLanguagePriority);

  const title = removeMarkdown(element.properties[titleKey] || parentId.toString());
  const choiceValue = choice[translationLanguagePriority] || choiceId.toString();

  return (
    <div>
      <div className="inline-block">
        <ConditionalIcon className="mr-2 mt-[-5px] inline-block" />
        <span>{title}</span>
        <span className="mx-1">-</span>
        <span className="font-medium">{choiceValue}</span>
      </div>
      <span className="hidden">{`${choiceValue}`}</span>
    </div>
  );
};

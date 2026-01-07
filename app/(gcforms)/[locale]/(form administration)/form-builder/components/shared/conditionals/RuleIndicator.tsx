import { useTemplateStore } from "@lib/store/useTemplateStore";

import { LocalizedFormProperties } from "@lib/types/form-builder-types";
import { ConditionalIcon } from "@serverComponents/icons/ConditionalIcon";
import { removeMarkdown } from "@lib/groups/utils/itemType";
import { Button } from "@clientComponents/globals";
import { useGroupStore } from "@root/lib/groups/useGroupStore";
import { findParentGroup } from "@lib/groups/utils/findParentGroup";

export const RuleIndicator = ({ choiceId }: { choiceId: string }) => {
  const { getChoice, getFormElementById, localizeField, translationLanguagePriority } =
    useTemplateStore((s) => ({
      getChoice: s.getChoice,
      getFormElementById: s.getFormElementById,
      localizeField: s.localizeField,
      translationLanguagePriority: s.translationLanguagePriority,
    }));

  const { setId, groups } = useGroupStore((s) => {
    return {
      groups: s.groups,
      setId: s.setId,
    };
  });

  const parentId = Number(choiceId.split(".")[0]);
  const childId = Number(choiceId.split(".")[1]);
  const element = getFormElementById(parentId);
  const choice = getChoice(parentId, childId);

  if (!element || !choice) return null;

  const titleKey = localizeField(LocalizedFormProperties.TITLE, translationLanguagePriority);

  const title = removeMarkdown(element.properties[titleKey] || parentId.toString());
  const choiceValue = choice[translationLanguagePriority] || choiceId.toString();

  const parentGroup = findParentGroup(groups, choiceId);

  const handleRuleIndicatorClick = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget as HTMLElement;
    const p = el.dataset.parentId;
    const c = el.dataset.childId;
    const group = el.dataset.groupId || "start";
    if (!p || !c) return;

    // Ensure we are in the correct group where the element resides
    setId(group);

    // Add a delay to allow the tree to render the selected group
    setTimeout(() => {
      const target = document.getElementById(`option--${p}--${c}`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        (target as HTMLElement).focus();
      }
    }, 100);
  };

  return (
    <div>
      <div className="inline-block">
        <Button
          theme="link"
          data-parent-id={String(parentId)}
          data-child-id={String(childId)}
          data-group-id={parentGroup}
          onClick={handleRuleIndicatorClick}
          className="cursor-pointer items-start justify-start p-0 text-left underline"
        >
          <>
            <ConditionalIcon className="mr-2 mt-[-5px] inline" />
            <span className="inline-block max-w-[200px] truncate align-middle" title={title}>
              {title}
            </span>
            <span className="mx-1">-</span>
            <span className="font-medium">{choiceValue}</span>
          </>
        </Button>
      </div>

      <span className="hidden">{`${choiceValue}`}</span>
    </div>
  );
};

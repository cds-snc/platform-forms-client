import React from "react";
import { useTranslation } from "next-i18next";
import { FormElementWithIndex } from "../../../types";
import { useTemplateStore } from "@components/form-builder/store";
import { ConditionalIcon } from "@components/form-builder/icons/ConditionalIcon";

const RuleIndicator = ({ choiceId }: { choiceId: string }) => {
  const { t } = useTranslation("form-builder");

  const getChoice = useTemplateStore((state) => state.getChoice);
  const translationLanguagePriority = useTemplateStore(
    (state) => state.translationLanguagePriority
  );

  const parentId = Number(choiceId.split(".")[0]);
  const childId = Number(choiceId.split(".")[1]);
  const choice = getChoice(parentId, childId);
  if (!choice) return null;
  const choiceValue = choice[translationLanguagePriority];
  return (
    <div>
      <ConditionalIcon className="mr-2 mt-[-5px] inline-block" />
      <div className="inline-block p-2">
        {t("question")} {`${parentId}`}
      </div>
      <span className="hidden">{`${choiceValue}`}</span>
    </div>
  );
};

export const ConditionalIndicator = ({ item }: { item: FormElementWithIndex }) => {
  const hasConditionalRules = item.properties.conditionalRules;

  if (!hasConditionalRules || !item.properties.conditionalRules) return null;

  const rules = item.properties.conditionalRules?.map((rule) => {
    const choiceId = rule?.choiceId as string;
    return (
      <div className="mt-2" key={choiceId}>
        <RuleIndicator choiceId={choiceId} />
      </div>
    );
  });

  return <>{rules}</>;
};

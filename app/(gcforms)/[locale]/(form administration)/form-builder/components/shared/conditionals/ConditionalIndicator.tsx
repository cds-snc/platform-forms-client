"use client";

import { type FormElementWithIndex } from "@lib/types/form-builder-types";
import { RuleIndicator } from "./RuleIndicator";

export const ConditionalIndicator = ({ item }: { item: FormElementWithIndex }) => {
  const hasConditionalRules = item.properties.conditionalRules;
  if (!hasConditionalRules || !item.properties.conditionalRules) return null;

  const itemId = item.index;
  const rules = item.properties.conditionalRules?.map((rule, index) => {
    const choiceId = rule?.choiceId as string;

    return (
      <div className="mt-2" key={`${choiceId}-${itemId}${index}--conditional-indicator`}>
        <RuleIndicator choiceId={choiceId} />
      </div>
    );
  });

  return <>{rules}</>;
};

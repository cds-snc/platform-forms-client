import { type NextActionRule } from "@gcforms/types";

export const filterNextActionRulesForItem = (itemId: number, nextActionRules: NextActionRule[]) => {
  return nextActionRules.filter((action) => {
    const choiceParentQuestion = action.choiceId?.split(".")[0];
    return choiceParentQuestion === String(itemId);
  });
};

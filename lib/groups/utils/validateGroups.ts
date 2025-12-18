import { NextActionRule, type Group, type GroupsType } from "@gcforms/types";

/**
 * Get a count of the number of groups with a nextAction of "review".
 *
 * @param formGroups GroupsType
 * @returns number
 */
const _getNextActionReviewCount = (formGroups: GroupsType) => {
  return Object.values(formGroups).filter((group) => group.nextAction === "review").length;
};

/**
 * If the current nextAction is "review" and it is the only group with a nextAction of "review",
 * prevent changing to "exit" as that would lead to a broken flow.
 *
 * @param formGroups GroupsType
 * @param nextAction string
 * @returns boolean
 */
export const canModifyNextAction = (
  formGroups: GroupsType,
  currentGroupNextAction: Group["nextAction"],
  nextAction: Group["nextAction"]
) => {
  const reviewCount = _getNextActionReviewCount(formGroups);

  return !(reviewCount <= 1 && nextAction === "exit" && currentGroupNextAction === "review");
};

/**
 * Cannot delete the group if it is the only group with a nextAction of "review",
 * as this would lead to a broken flow.
 *
 * @param formGroups GroupsType
 * @param currentGroupNextAction string
 * @returns boolean
 */
export const canDeleteGroup = (
  formGroups: GroupsType,
  currentGroupNextAction: string | NextActionRule[]
) => {
  const reviewCount = _getNextActionReviewCount(formGroups);

  if (Array.isArray(currentGroupNextAction)) {
    // Check if any rule is "review"
    const hasReview = currentGroupNextAction.some((rule) => rule?.groupId === "review");
    return !(reviewCount <= 1 && hasReview);
  }

  return !(reviewCount <= 1 && currentGroupNextAction === "review");
};

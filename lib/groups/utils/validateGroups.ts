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

// These destinations end navigation rather than pointing to another page.
const terminalActions = new Set(["end", "exit", "review"]);

const getNextGroupIds = (nextAction: Group["nextAction"]): string[] => {
  if (Array.isArray(nextAction)) {
    return nextAction.map((action) => action.groupId).filter(Boolean) as string[];
  }

  return nextAction ? [nextAction] : [];
};

/**
 * Returns true when replacing a page's next action would create a navigation cycle.
 *
 * Conditional rules are treated as multiple outgoing edges from the same page.
 * A page can therefore be part of a cycle through any of its rule destinations.
 */
export const createsNextActionCycle = (
  formGroups: GroupsType,
  groupId: string,
  nextAction: Group["nextAction"]
) => {
  // Create a copy of the current groups with the proposed next action for the specified group.
  const groups = {
    ...formGroups,
    [groupId]: { ...formGroups[groupId], nextAction },
  };

  // Pages being explored.
  const visiting = new Set<string>();

  // Pages already fully checked.
  const visited = new Set<string>();

  const visit = (currentGroupId: string): boolean => {
    // Reaching a page already on the current path means we found a cycle.
    if (visiting.has(currentGroupId)) return true;

    // This page was checked from another path, so it cannot add a new cycle.
    if (visited.has(currentGroupId) || !groups[currentGroupId]) return false;

    // Mark the page as active while exploring all of its destinations.
    visiting.add(currentGroupId);

    // A page may have one destination or several conditional-rule destinations.
    const hasCycle = getNextGroupIds(groups[currentGroupId].nextAction).some((nextGroupId) => {
      // Terminal destinations end the path and cannot continue a cycle.
      if (terminalActions.has(nextGroupId)) return false;

      // Continue following this destination until it ends or repeats a page.
      return visit(nextGroupId);
    });

    // Remove the page from the active path before returning to its caller.
    visiting.delete(currentGroupId);

    // Cache this page as completely checked for other traversal paths.
    visited.add(currentGroupId);

    // Pass the result back to the page that led us here.
    return hasCycle;
  };

  // Start a traversal from every page so disconnected page groups are checked too.
  return Object.keys(groups).some(visit);
};

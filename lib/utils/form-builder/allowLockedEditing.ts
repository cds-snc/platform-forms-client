import { checkOne } from "@lib/cache/flags";
import { FeatureFlags } from "@lib/cache/types";
import { featureFlagAllowedForUser } from "@lib/userFeatureFlags";

export const allowLockedEditing = async (userId?: string) => {
  if (userId) {
    return featureFlagAllowedForUser(userId, FeatureFlags.lockedEditing);
  }

  return checkOne(FeatureFlags.lockedEditing);
};

import { checkOne } from "@lib/cache/flags";
import { FeatureFlags } from "@lib/cache/types";
import { featureFlagAllowedForUser } from "@lib/userFeatureFlags";

export const allowLockedEditing = async (userId?: string) => {
  const globalFlag = await checkOne(FeatureFlags.lockedEditing);

  if (globalFlag) {
    // If the global flag is enabled, allow locked editing for all users
    return true;
  }

  if (userId) {
    // If the user has the feature flag enabled, allow locked editing for that user
    return featureFlagAllowedForUser(userId, FeatureFlags.lockedEditing);
  }

  return false;
};

import { authorization } from "@lib/privileges";
import { prisma } from "@lib/integration/prismaConnector";
import { featureFlagsCheck, featureFlagsPut } from "@lib/cache/userFeatureFlagsCache";
import { FeatureFlagKeys } from "./cache/types";
import { checkOne } from "./cache/flags";

/**
 * Get all feature flags enabled for a user.
 * @param userId id of the user
 * @returns Array of feature flag keys (strings)
 */
export const getUserFeatureFlags = async (userId: string): Promise<string[]> => {
  try {
    // Try cache first
    const cachedFlags = await featureFlagsCheck(userId);
    if (cachedFlags?.length) return cachedFlags;

    // Query DB for enabled features
    const userFeatures = await prisma.user
      .findUnique({
        where: { id: userId },
      })
      ?.features({ select: { feature: true } });

    const featureKeys = userFeatures ? userFeatures.map((uf) => uf.feature) : [];

    // Cache result
    await featureFlagsPut(userId, featureKeys);

    return featureKeys;
  } catch (error) {
    // If there's an error, return an empty array
    return [];
  }
};

// Remove a specific feature flag for a user
export const removeUserFeatureFlag = async (userId: string, flag: string): Promise<void> => {
  await authorization.canManageFlags();
  await authorization.canManageUser(userId);

  try {
    // Get current flags
    const currentFlags = await getUserFeatureFlags(userId);

    // Filter out the flag to be removed
    const updatedFlags = currentFlags.filter((f) => f !== flag);

    if (updatedFlags.length > 0) {
      // Update the database with the remaining features
      await prisma.userFeature.delete({
        where: {
          userId_feature: {
            userId,
            feature: flag,
          },
        },
      });
    } else {
      // If no features left, disconnect all features
      await prisma.userFeature.deleteMany({
        where: { userId },
      });
    }

    // Update the cache
    await featureFlagsPut(userId, updatedFlags);
  } catch (error) {
    throw new Error(`Failed to remove feature flag: ${error}`);
  }
};

// Add multiple feature flags for a user
export const addUserFeatureFlags = async (userId: string, flags: string[]): Promise<void> => {
  await authorization.canManageFlags();
  await authorization.canManageUser(userId);

  try {
    // Get current flags
    const currentFlags = await getUserFeatureFlags(userId);

    // Filter out any flags that are already set
    const newFlags = flags.filter((flag) => !currentFlags.includes(flag));

    if (newFlags.length > 0) {
      const updatedFlags = [...currentFlags, ...newFlags];

      // Update the database
      await prisma.userFeature.createMany({
        data: newFlags.map((feature) => ({ userId, feature })),
        skipDuplicates: true, // avoids error if the (userId, feature) already exists
      });

      // Update the cache
      await featureFlagsPut(userId, updatedFlags);
    }
  } catch (error) {
    throw new Error(`Failed to add feature flags: ${error}`);
  }
};

export const featureFlagAllowedForUser = async (
  userId: string,
  flag: FeatureFlagKeys
): Promise<boolean> => {
  // Check if flag is enabled globally
  const flagEnabled = await checkOne(flag);
  // Check if user has the flag
  const userFlags = await getUserFeatureFlags(userId);
  const userFlag = userFlags.find((matchFlag) => matchFlag === flag);
  return userFlag || flagEnabled ? true : false;
};

/**
 * Get all user feature flags enabled.
 * @returns Array of user and feature data
 */
export const getAllUsersWithFeatures = async (): Promise<
  {
    userText: string;
    userId: string;
    feature: string;
  }[]
> => {
  try {
    const usersWithFlags = await prisma.userFeature.findMany({
      select: {
        feature: true,
        userId: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return usersWithFlags.map((uf) => ({
      feature: uf.feature,
      userId: uf.userId,
      userText: uf.user ? `${uf.user.name} (${uf.user.email})` : uf.userId,
    }));
  } catch (error) {
    return [];
  }
};

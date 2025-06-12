import { prisma } from "@lib/integration/prismaConnector";
import { featureFlagsCheck, featureFlagsPut } from "@lib/cache/userFeatureFlagsCache";

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
      .features({ select: { feature: true } });

    const featureKeys = userFeatures.map((uf) => uf.feature);

    // Cache result
    await featureFlagsPut(userId, featureKeys);

    return featureKeys;
  } catch (error) {
    // If there's an error, return an empty array
    return [];
  }
};

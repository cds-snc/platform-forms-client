// Load from file so we have a static list of flag names (vs. from Redis where state would be important)
import flagInitialSettings from "flag_initialization/default_flag_settings.json";

const flagKeys = Object.keys(flagInitialSettings);
export type FeatureFlagKeys = (typeof flagKeys)[number];

export const FeatureFlags = {} as Record<FeatureFlagKeys, FeatureFlagKeys>;
flagKeys.forEach((key) => {
  FeatureFlags[key] = key as FeatureFlagKeys;
});

export type Flags = {
  [K in FeatureFlagKeys]: boolean;
};

// Utility type to pick only the keys provided in the flags array
export type PickFlags<T extends FeatureFlagKeys[]> = {
  [K in T[number]]: boolean;
};

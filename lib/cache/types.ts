// Load from file so we have a static list of flag names (vs. from Redis state would be important)
import flagInitialSettings from "flag_initialization/default_flag_settings.json";

export const FeatureFlags = {} as Record<string, string>;
for (const key in flagInitialSettings) {
  FeatureFlags[key] = key;
}

export type FeatureFlagKeys = keyof typeof FeatureFlags;

export type Flags = {
  [K in FeatureFlagKeys]: boolean;
};

// Utility type to pick only the keys provided in the flags array
export type PickFlags<T extends FeatureFlagKeys[]> = {
  [K in T[number]]: boolean;
};

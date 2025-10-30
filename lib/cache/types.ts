// TODO: in the future these could pulled in from default_flag_settings.json

export const UserFeatureFlags = {
  addressComplete: "addressComplete",
} as const;

export const FeatureFlags = {
  formTimer: "formTimer",
  hCaptcha: "hCaptcha",
  topBanner: "topBanner",
  ...UserFeatureFlags,
} as const;

export type FeatureFlagKeys = keyof typeof FeatureFlags;

export type UserFeatureFlagKeys = keyof typeof UserFeatureFlags;

export type Flags = {
  [K in FeatureFlagKeys]: boolean;
};

// Utility type to pick only the keys provided in the flags array
export type PickFlags<T extends FeatureFlagKeys[]> = {
  [K in T[number]]: boolean;
};

// TODO: in the future these could pulled in from default_flag_settings.json
export const FeatureFlags = {
  addressComplete: "addressComplete",
  repeatingSets: "repeatingSets",
  scheduleClosingDate: "scheduleClosingDate",
  apiAccess: "apiAccess",
  saveAndResume: "saveAndResume",
  formTimer: "formTimer",
  hCaptcha: "hCaptcha",
} as const;

export type FeatureFlagKeys = keyof typeof FeatureFlags;

export type Flags = {
  [K in FeatureFlagKeys]: boolean;
};

// Utility type to pick only the keys provided in the flags array
export type PickFlags<T extends FeatureFlagKeys[]> = {
  [K in T[number]]: boolean;
};

export type AllAppSettings =
  | {
      internalId: string;
      descriptionEn: string | null;
      descriptionFr: string | null;
      nameEn: string;
      nameFr: string;
      value: string | null;
    }[]
  | never[];

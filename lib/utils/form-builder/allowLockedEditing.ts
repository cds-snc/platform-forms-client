import { checkOne } from "@lib/cache/flags";
import { FeatureFlags } from "@lib/cache/types";

export const allowLockedEditing = async () => checkOne(FeatureFlags.lockedEditing);

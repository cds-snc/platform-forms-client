import { publicDefinition } from "./public";
import { builderDefinition } from "./builder";
import { sharedDefinition } from "./shared";

export const formattedDateDefinition = {
  ...publicDefinition,
  ...builderDefinition,
  ...sharedDefinition,
};

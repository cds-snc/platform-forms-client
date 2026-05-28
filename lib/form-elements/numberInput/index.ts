import { publicDefinition } from "./public";
import { builderDefinition } from "./builder";

export const numberInputDefinition = {
  ...publicDefinition,
  ...builderDefinition,
};

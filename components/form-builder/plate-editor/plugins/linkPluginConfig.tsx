import { LinkPlugin } from "@udecode/plate-link";
import { PlateFloatingLink } from "@udecode/plate-ui";
import { MyPlatePlugin } from "../types";

export const linkPluginConfig: Partial<MyPlatePlugin<LinkPlugin>> = {
  renderAfterEditable: PlateFloatingLink,
};

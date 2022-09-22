import { LinkPlugin } from "@udecode/plate-link";
import { PlateFloatingLink } from "@udecode/plate-ui";
import { MyPlatePlugin } from "../types";

export const linkPlugin: Partial<MyPlatePlugin<LinkPlugin>> = {
  renderAfterEditable: PlateFloatingLink,
};

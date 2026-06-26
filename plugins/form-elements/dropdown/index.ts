import dynamic from "next/dynamic";
import { SelectMenuIcon } from "@serverComponents/icons";
import { FormElementTypes } from "@lib/types";
import type { FormElementPlugin } from "../types";
import { ViewerComponent } from "./ViewerComponent";
import { BuilderComponent } from "./BuilderComponent";
import { ReviewComponent } from "./ReviewComponent";
import { defaultProperties } from "./defaultProperties";
import { normalize } from "./normalize";
import { toString } from "./toString";

const BuilderDescription = dynamic(() => import("./BuilderDescription"), {
  ssr: false,
});

export const dropdownPlugin: FormElementPlugin = {
  type: FormElementTypes.dropdown,
  BuilderIcon: SelectMenuIcon,
  builderLabelKey: "addElementDialog.dropdown.title",
  BuilderDescription,
  group: "basic",
  ViewerComponent,
  BuilderComponent,
  ReviewComponent,
  defaultProperties,
  normalize,
  toString,
};

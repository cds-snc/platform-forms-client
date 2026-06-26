import dynamic from "next/dynamic";
import { CheckIcon } from "@serverComponents/icons";
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

export const checkboxPlugin: FormElementPlugin = {
  type: FormElementTypes.checkbox,
  BuilderIcon: CheckIcon,
  builderLabelKey: "addElementDialog.checkbox.title",
  BuilderDescription,
  group: "basic",
  ViewerComponent,
  BuilderComponent,
  ReviewComponent,
  defaultProperties,
  normalize,
  toString,
};

import dynamic from "next/dynamic";
import { RadioIcon } from "@serverComponents/icons";
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

export const radioPlugin: FormElementPlugin = {
  type: FormElementTypes.radio,
  BuilderIcon: RadioIcon,
  builderLabelKey: "addElementDialog.radio.title",
  BuilderDescription,
  group: "basic",
  ViewerComponent,
  BuilderComponent,
  ReviewComponent,
  defaultProperties,
  normalize,
  toString,
};

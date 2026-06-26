import dynamic from "next/dynamic";
import { AddressIcon } from "@serverComponents/icons";
import { FormElementTypes } from "@lib/types";
import { FeatureFlags } from "@lib/cache/types";
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

export const addressCompletePlugin: FormElementPlugin = {
  type: FormElementTypes.addressComplete,
  BuilderIcon: AddressIcon,
  builderLabelKey: "addElementDialog.addressComplete.title",
  BuilderDescription,
  group: "preset",
  betaFlag: FeatureFlags.addressComplete,
  ViewerComponent,
  BuilderComponent,
  ReviewComponent,
  defaultProperties,
  normalize,
  toString,
};

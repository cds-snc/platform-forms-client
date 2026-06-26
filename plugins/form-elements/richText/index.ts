import dynamic from "next/dynamic";
import { ParagraphIcon } from "@serverComponents/icons";
import { FormElementTypes } from "@lib/types";
import type { FormElementPlugin } from "../types";
import { ViewerComponent } from "./ViewerComponent";
import { BuilderComponent } from "./BuilderComponent";
import { defaultProperties } from "./defaultProperties";
import { normalize } from "./normalize";
import { toString } from "./toString";

const BuilderDescription = dynamic(() => import("./BuilderDescription"), {
  ssr: false,
});

export const richTextPlugin: FormElementPlugin = {
  type: FormElementTypes.richText,
  BuilderIcon: ParagraphIcon,
  builderLabelKey: "richText",
  BuilderDescription,
  group: "other",
  // richText is static content — it has no response to show in the review page.
  ReviewComponent: null,
  ViewerComponent,
  BuilderComponent,
  defaultProperties,
  normalize,
  toString,
};

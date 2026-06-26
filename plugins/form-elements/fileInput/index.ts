import dynamic from "next/dynamic";
import { UploadIcon } from "@serverComponents/icons";
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

export const fileInputPlugin: FormElementPlugin = {
  type: FormElementTypes.fileInput,
  BuilderIcon: UploadIcon,
  builderLabelKey: "addElementDialog.fileInput.title",
  BuilderDescription,
  group: "other",
  ViewerComponent,
  BuilderComponent,
  ReviewComponent,
  defaultProperties,
  normalize,
  toString,
};

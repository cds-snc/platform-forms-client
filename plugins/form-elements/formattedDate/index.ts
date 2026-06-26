import dynamic from "next/dynamic";
import { CalendarIcon } from "@serverComponents/icons";
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

export const formattedDatePlugin: FormElementPlugin = {
  type: FormElementTypes.formattedDate,
  BuilderIcon: CalendarIcon,
  builderLabelKey: "addElementDialog.formattedDate.title",
  BuilderDescription,
  group: "preset",
  ViewerComponent,
  BuilderComponent,
  ReviewComponent,
  defaultProperties,
  normalize,
  toString,
};

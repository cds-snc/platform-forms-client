"use client";

import { ParagraphIcon } from "@serverComponents/icons";
import dynamic from "next/dynamic";
import { FormElementTypes } from "@lib/types";
import type { FormElementPlugin } from "@lib/form-elements/types";
import { ViewerComponent } from "./ViewerComponent";
import { BuilderComponent } from "./BuilderComponent";

const BuilderDescription = dynamic(
  () =>
    import("@formBuilder/[id]/edit/components/elements/element-dialog/descriptions/TextArea").then(
      (mod) => ({ default: mod.TextArea })
    ),
  { ssr: false }
);

export const textAreaPlugin: FormElementPlugin = {
  type: FormElementTypes.textArea,

  BuilderIcon: ParagraphIcon,
  builderLabelKey: "addElementDialog.textArea.label",
  BuilderDescription,
  group: "basic",

  ViewerComponent,
  BuilderComponent,

  defaultProperties: {
    titleEn: "",
    titleFr: "",
    placeholderEn: "",
    placeholderFr: "",
    descriptionEn: "",
    descriptionFr: "",
    validation: { required: false },
  },

  initialValue: "",
};

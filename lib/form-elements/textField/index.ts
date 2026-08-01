"use client";

import { ShortAnswerIcon } from "@serverComponents/icons";
import dynamic from "next/dynamic";
import { FormElementTypes } from "@lib/types";
import type { FormElementPlugin } from "@lib/form-elements/types";
import { ViewerComponent } from "./ViewerComponent";
import { BuilderComponent } from "./BuilderComponent";

const BuilderDescription = dynamic(
  () =>
    import("@formBuilder/[id]/edit/components/elements/element-dialog/descriptions/TextField").then(
      (mod) => ({ default: mod.TextField })
    ),
  { ssr: false }
);

export const textFieldPlugin: FormElementPlugin = {
  type: FormElementTypes.textField,

  BuilderIcon: ShortAnswerIcon,
  builderLabelKey: "addElementDialog.textField.label",
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

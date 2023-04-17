import { useTranslation } from "next-i18next";
import {
  CalendarIcon,
  CheckIcon,
  NumericFieldIcon,
  ParagraphIcon,
  RadioIcon,
  SelectMenuIcon,
  ShortAnswerIcon,
  AddIcon,
  ContactIcon,
  AddressIcon,
  NameIcon,
  UploadIcon,
} from "../icons";

import {
  RichText,
  Radio,
  CheckBox,
  DropDown,
  TextField,
  TextArea,
  Date,
  Number,
  QuestionSet,
  Attestation,
  Address,
  Name,
  Contact,
  FirstMiddleLastName,
  FileInput,
} from "../app/edit/elements/element-dialog";

import { useIsAdminUser } from "./useIsAdminUser";

import { ElementOptionsFilter, ElementOption } from "../types";
import { useFlag } from "@lib/hooks";

export const useElementOptions = (filterElements?: ElementOptionsFilter | undefined) => {
  const { t } = useTranslation("form-builder");
  const group = {
    layout: { id: "layout", value: t("addElementDialog.layoutBlocks") },
    input: { id: "input", value: t("addElementDialog.inputBlocks") },
    advanced: { id: "advanced", value: t("addElementDialog.advancedBlocks") },
  };

  // default to off unless the user is an admin
  const allowFileInput = useIsAdminUser();

  const { status: experimentalBlocks } = useFlag("experimentalBlocks");

  const fileInputOption: ElementOption = {
    id: "fileInput",
    value: t("addElementDialog.fileInput.label"),
    icon: UploadIcon,
    description: FileInput,
    className: "",
    group: group.input,
  };

  const repeatingSetsOption: ElementOption = {
    id: "dynamicRow",
    value: t("dyanamicRow"),
    icon: AddIcon,
    description: QuestionSet,
    className: "",
    group: group.advanced,
  };

  const elementOptions: ElementOption[] = [
    {
      id: "richText",
      value: t("richText"),
      icon: ParagraphIcon,
      description: RichText,
      className: "",
      group: group.layout,
    },
    {
      id: "textField",
      value: t("shortAnswer"),
      icon: ShortAnswerIcon,
      description: TextField,
      className: "",
      group: group.input,
    },
    {
      id: "textArea",
      value: t("paragraph"),
      icon: ParagraphIcon,
      description: TextArea,
      className: "separator",
      group: group.input,
    },
    {
      id: "radio",
      value: t("singleChoice"),
      icon: RadioIcon,
      description: Radio,
      className: "",
      group: group.input,
    },
    {
      id: "checkbox",
      value: t("checkboxes"),
      icon: CheckIcon,
      description: CheckBox,
      className: "",
      group: group.input,
    },
    {
      id: "dropdown",
      value: t("dropdown"),
      icon: SelectMenuIcon,
      description: DropDown,
      className: "separator",
      group: group.input,
    },
    {
      id: "date",
      value: t("date"),
      icon: CalendarIcon,
      description: Date,
      className: "",
      group: group.input,
    },
    {
      id: "number",
      value: t("numericField"),
      icon: NumericFieldIcon,
      description: Number,
      className: "",
      group: group.input,
    },
    allowFileInput ? { ...(fileInputOption as ElementOption) } : ({} as ElementOption),
    {
      id: "attestation",
      value: t("attestation"),
      icon: AddIcon,
      description: Attestation,
      className: "separator",
      group: group.input,
    },
    {
      id: "name",
      value: t("addElementDialog.name.label"),
      icon: NameIcon,
      description: Name,
      group: group.input,
    },
    {
      id: "firstMiddleLastName",
      value: t("addElementDialog.firstMiddleLastName.label"),
      icon: NameIcon,
      description: FirstMiddleLastName,
      group: group.input,
    },
    {
      id: "address",
      value: "Address",
      icon: AddressIcon,
      description: Address,
      group: group.input,
    },
    {
      id: "contact",
      value: t("addElementDialog.contact.label"),
      icon: ContactIcon,
      description: Contact,
      className: "separator",
      group: group.input,
    },
    experimentalBlocks ? { ...(repeatingSetsOption as ElementOption) } : ({} as ElementOption),
  ];

  return filterElements ? filterElements(elementOptions) : elementOptions;
};

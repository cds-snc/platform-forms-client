import React from "react";
import { useFlag } from "@lib/hooks";
import { useTranslation } from "next-i18next";
import {
  CalendarIcon,
  CheckIcon,
  EmailIcon,
  NumericFieldIcon,
  ParagraphIcon,
  PhoneIcon,
  RadioIcon,
  SelectMenuIcon,
  ShortAnswerIcon,
  AddIcon,
} from "../icons";

import {
  RichText,
  Radio,
  CheckBox,
  DropDown,
  TextField,
  TextArea,
  Phone,
  Email,
  Date,
  Number,
  QuestionSet,
  Attestation,
  PostalCode,
} from "../app/edit/elements/element-dialog";

import { ElementOptionsFilter, ElementOption } from "../types";

export const useElementOptions = (filterElements?: ElementOptionsFilter | undefined) => {
  const { t } = useTranslation("form-builder");
  const { status: experimentalBlocks } = useFlag("formBuilderExperimentalBlocks");

  const group = {
    layout: { id: "layout", value: t("addElementDialog.layoutBlocks") },
    input: { id: "input", value: t("addElementDialog.inputBlocks") },
    advanced: { id: "advanced", value: t("addElementDialog.advancedBlocks") },
  };

  const elementOptions: ElementOption[] = [
    {
      id: "richText",
      value: t("richText"),
      icon: <ParagraphIcon />,
      description: RichText,
      className: "",
      group: group.layout,
    },
    {
      id: "textField",
      value: t("shortAnswer"),
      icon: <ShortAnswerIcon />,
      description: TextField,
      className: "",
      group: group.input,
    },
    {
      id: "textArea",
      value: t("paragraph"),
      icon: <ParagraphIcon />,
      description: TextArea,
      className: "separator",
      group: group.input,
    },
    {
      id: "radio",
      value: t("singleChoice"),
      icon: <RadioIcon />,
      description: Radio,
      className: "",
      group: group.input,
    },
    {
      id: "checkbox",
      value: t("checkboxes"),
      icon: <CheckIcon />,
      description: CheckBox,
      className: "",
      group: group.input,
    },
    {
      id: "dropdown",
      value: t("dropdown"),
      icon: <SelectMenuIcon />,
      description: DropDown,
      className: "separator",
      group: group.input,
    },
    {
      id: "date",
      value: t("date"),
      icon: <CalendarIcon />,
      description: Date,
      className: "",
      group: group.input,
    },
    {
      id: "number",
      value: t("numericField"),
      icon: <NumericFieldIcon />,
      description: Number,
      className: "",
      group: group.input,
    },
    {
      id: "attestation",
      value: t("attestation"),
      icon: <AddIcon />,
      description: Attestation,
      className: "separator",
      group: group.input,
    },
    {
      id: "postal-code",
      value: t("addElementDialog.postal-code.label"),
      icon: <ShortAnswerIcon />,
      description: PostalCode,
      className: "separator",
      group: group.input,
    },
    {
      id: "phone",
      value: t("phoneNumber"),
      icon: <PhoneIcon />,
      description: Phone,
      className: "",
      group: group.input,
    },
    {
      id: "email",
      value: t("email"),
      icon: <EmailIcon />,
      description: Email,
      className: "",
      group: group.input,
    },
    {
      id: "dynamicRow",
      value: t("dyanamicRow"),
      icon: <AddIcon />,
      description: QuestionSet,
      className: "",
      group: group.advanced,
    },
  ];

  if (experimentalBlocks) {
    // add experimental blocks here:
    // elementOptions.push();
  }

  return filterElements ? filterElements(elementOptions) : elementOptions;
};

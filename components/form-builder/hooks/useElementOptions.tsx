import React from "react";
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
} from "../app/edit/elements/element-dialog";

export const useElementOptions = () => {
  const { t } = useTranslation("form-builder");
  const elementOptions = [
    {
      id: "richText",
      value: t("richText"),
      icon: <ParagraphIcon />,
      description: RichText,
      className: "separator",
    },
    {
      id: "radio",
      value: t("singleChoice"),
      icon: <RadioIcon />,
      description: Radio,
      className: "",
    },
    {
      id: "checkbox",
      value: t("checkboxes"),
      icon: <CheckIcon />,
      description: CheckBox,
      className: "",
    },
    {
      id: "dropdown",
      value: t("dropdown"),
      icon: <SelectMenuIcon />,
      description: DropDown,
      className: "separator",
    },
    {
      id: "textField",
      value: t("shortAnswer"),
      icon: <ShortAnswerIcon />,
      description: TextField,
      className: "",
    },
    {
      id: "textArea",
      value: t("paragraph"),
      icon: <ParagraphIcon />,
      description: TextArea,
      className: "separator",
    },
    {
      id: "phone",
      value: t("phoneNumber"),
      icon: <PhoneIcon />,
      description: Phone,
      className: "",
    },
    {
      id: "email",
      value: t("email"),
      icon: <EmailIcon />,
      description: Email,
      className: "",
    },
    {
      id: "date",
      value: t("date"),
      icon: <CalendarIcon />,
      description: Date,
      className: "",
    },
    {
      id: "number",
      value: t("numericField"),
      icon: <NumericFieldIcon />,
      description: Number,
      className: "",
    },
  ];

  return elementOptions;
};

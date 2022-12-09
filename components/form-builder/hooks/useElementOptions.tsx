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

export const useElementOptions = () => {
  const { t } = useTranslation("form-builder");
  const elementOptions = [
    { id: "richText", value: t("richText"), icon: <ParagraphIcon />, className: "separator" },
    { id: "radio", value: t("singleChoice"), icon: <RadioIcon />, className: "" },
    { id: "checkbox", value: t("checkboxes"), icon: <CheckIcon />, className: "" },
    { id: "dropdown", value: t("dropdown"), icon: <SelectMenuIcon />, className: "separator" },
    { id: "textField", value: t("shortAnswer"), icon: <ShortAnswerIcon />, className: "" },
    { id: "textArea", value: t("paragraph"), icon: <ParagraphIcon />, className: "separator" },
    { id: "phone", value: t("phoneNumber"), icon: <PhoneIcon />, className: "" },
    { id: "email", value: t("email"), icon: <EmailIcon />, className: "" },
    { id: "date", value: t("date"), icon: <CalendarIcon />, className: "" },
    { id: "number", value: t("numericField"), icon: <NumericFieldIcon />, className: "" },
  ];

  return elementOptions;
};

import React from "react";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
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

const Separator = styled.div`
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  margin: 8px 0;
`;

export const useElementOptions = () => {
  const { t } = useTranslation("form-builder");
  const elementOptions = [
    { id: "richText", value: t("richText"), icon: <ParagraphIcon />, append: <Separator /> },
    { id: "radio", value: t("singleChoice"), icon: <RadioIcon /> },
    { id: "checkbox", value: t("checkboxes"), icon: <CheckIcon /> },
    { id: "dropdown", value: t("dropdown"), icon: <SelectMenuIcon />, append: <Separator /> },
    { id: "textField", value: t("shortAnswer"), icon: <ShortAnswerIcon /> },
    { id: "textArea", value: t("paragraph"), icon: <ParagraphIcon />, append: <Separator /> },
    { id: "phone", value: t("phoneNumber"), icon: <PhoneIcon /> },
    { id: "email", value: t("email"), icon: <EmailIcon /> },
    { id: "date", value: t("date"), icon: <CalendarIcon /> },
    { id: "number", value: t("numericField"), icon: <NumericFieldIcon /> },
  ];

  return elementOptions;
};

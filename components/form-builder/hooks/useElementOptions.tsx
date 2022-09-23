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
    { id: "textField", value: t("shortAnswer"), icon: <ShortAnswerIcon /> },
    { id: "richText", value: t("richText"), icon: <ParagraphIcon /> },
    { id: "textArea", value: t("paragraph"), icon: <ParagraphIcon />, prepend: <Separator /> },
    { id: "radio", value: t("multipleChoice"), icon: <RadioIcon /> },
    { id: "checkbox", value: t("checkboxes"), icon: <CheckIcon /> },
    { id: "dropdown", value: t("dropdown"), icon: <SelectMenuIcon />, prepend: <Separator /> },
    { id: "email", value: t("email"), icon: <EmailIcon /> },
    { id: "phone", value: t("phoneNumber"), icon: <PhoneIcon /> },
    { id: "date", value: t("date"), icon: <CalendarIcon /> },
    { id: "number", value: t("numericField"), icon: <NumericFieldIcon /> },
  ];

  return elementOptions;
};

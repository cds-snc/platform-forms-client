import { t } from "i18next";
import React from "react";
import styled from "styled-components";
import { useTranslation } from "next-i18next";

const StyledDiv = styled.div`
  font-size: 1rem;
`;

const StyledUl = styled.ul`
  margin-top: 10px;
  margin-bottom: 20px;
`;

export const ConfirmationDescription = () => {
  const { t } = useTranslation("form-builder");
  return (
    <StyledDiv>
      <p>{t("confirmationDescriptionParagraph")}</p>
      <StyledUl>
        <li>{t("confirmationDescriptionItem1")}</li>
        <li>{t("confirmationDescriptionItem2")}</li>
        <li>{t("confirmationDescriptionItem3")}</li>
        <li>{t("confirmationDescriptionItem4")}</li>
      </StyledUl>
    </StyledDiv>
  );
};

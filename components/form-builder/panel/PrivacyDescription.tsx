import { useTranslation } from "next-i18next";
import React from "react";
import styled from "styled-components";

const StyledDiv = styled.div`
  font-size: 1rem;
  margin-bottom: 20px;
`;

const { t } = useTranslation("form-builder");

export const PrivacyDescription = () => {
  return (
    <StyledDiv>
      <p>{t("privacyNoticeDescription")}</p>
    </StyledDiv>
  );
};

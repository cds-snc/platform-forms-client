import Markdown from "markdown-to-jsx";
import { useTranslation } from "next-i18next";
import React from "react";
import styled from "styled-components";

const StyledDiv = styled.div`
  font-size: 1rem;
  margin-bottom: 20px;
`;

export const PrivacyDescription = () => {
  const { t } = useTranslation("form-builder");
  return (
    <StyledDiv>
      <Markdown options={{ forceBlock: true }}>{t("privacyNoticeDescription")}</Markdown>
    </StyledDiv>
  );
};

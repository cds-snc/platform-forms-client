import React from "react";
import styled from "styled-components";
import { useTranslation } from "next-i18next";
import { DownloadFileButton } from "./DownloadFileButton";
import { CopyToClipboard } from "./CopyToClipboard";
import { Output } from "./Output";

const BottomMargin = styled.div`
  margin-bottom: 1.5rem;
`;

const NumberedHeading = styled.h2`
  font-size: 24px;

  span:first-of-type {
    background: black;
    color: white;
    display: inline-block;
    text-align: center;
    line-height: 1;
    padding: 5px 10px;
    border-radius: 50%;
    margin-right: 10px;
  }
`;

const StyledDetails = styled.details`
  summary {
    cursor: pointer;
    text-decoration: underline;
    margin-bottom: 1.5rem;
  }
`;

export const Save = () => {
  const { t } = useTranslation("form-builder");

  return (
    <>
      <BottomMargin>
        <p>{t("saveP1")}</p>
      </BottomMargin>
      <BottomMargin>
        <p>{t("saveP2")}</p>
      </BottomMargin>
      <br />

      <NumberedHeading>
        <span>1</span>
        <span>{t("saveH2")}</span>
      </NumberedHeading>
      <BottomMargin>
        <p>{t("saveP3")}</p>
      </BottomMargin>
      <NumberedHeading>
        <span>2</span>
        <span>{t("saveH3")}</span>
      </NumberedHeading>
      <BottomMargin>
        <p>{t("saveP4")}</p>
      </BottomMargin>

      <BottomMargin>
        <DownloadFileButton />
      </BottomMargin>

      <StyledDetails>
        <summary>{t("viewCode")}</summary>

        <CopyToClipboard />
        <Output />
      </StyledDetails>
    </>
  );
};

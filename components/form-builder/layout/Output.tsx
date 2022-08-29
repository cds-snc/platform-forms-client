import React from "react";
import styled from "styled-components";
import { useGetTemplate } from "../hooks/useGetTemplate";
import { CopyToClipboard } from "./CopyToClipboard";

const JSONOutput = styled.pre`
  margin-top: 20px;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  overflow: "scroll";
`;

const Separator = styled.div`
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  margin: 20px 0;
`;

export const Output = () => {
  const { stringified } = useGetTemplate();

  return (
    <>
      <Separator />
      <h2 className="gc-h2">JSON Output</h2>
      <CopyToClipboard />
      <JSONOutput>{stringified}</JSONOutput>
    </>
  );
};

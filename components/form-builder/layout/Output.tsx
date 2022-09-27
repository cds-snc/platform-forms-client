import React from "react";
import styled from "styled-components";
import useTemplateStore from "../store/useTemplateStore";
import { DownloadFileButton } from "./DownloadFileButton";

const JSONOutput = styled.pre`
  margin-top: 20px;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  overflow: "scroll";
`;

export const Output = () => {
  const { getSchema } = useTemplateStore();
  const stringified = getSchema();

  return (
    <>
      <DownloadFileButton />
      <h2 className="gc-h2">JSON Output</h2>
      <JSONOutput>{stringified}</JSONOutput>
    </>
  );
};

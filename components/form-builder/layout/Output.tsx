import React from "react";
import styled from "styled-components";
import useTemplateStore from "../store/useTemplateStore";
import { CopyToClipboard } from "./CopyToClipboard";

const JSONOutput = styled.pre`
  margin-top: 20px;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  overflow: "scroll";
`;

const Separator = styled.hr`
  display: block;
  margin-top: 20px;
  padding-bottom: 20px;
  cursor: pointer;
`;

export const Output = () => {
  const { getSerializedSchema } = useTemplateStore();
  const stringified = getSerializedSchema();

  const [showJSON, setShowJSON] = React.useState(false);
  const handleClick = () => setShowJSON(!showJSON);

  return (
    <>
      <Separator onClick={handleClick} />
      {showJSON && (
        <>
          <h2 className="gc-h2">JSON Output</h2>
          <CopyToClipboard />
          <JSONOutput>{stringified}</JSONOutput>
        </>
      )}
    </>
  );
};

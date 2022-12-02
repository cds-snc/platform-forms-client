import React from "react";
import styled from "styled-components";
import { useTemplateStore } from "../../store/useTemplateStore";

const JSONOutput = styled.pre`
  margin-top: 20px;
  padding: 20px;
  border: 2px solid rgba(0, 0, 0, 0.5);
  overflow: "scroll";
`;

export const Output = () => {
  const getSchema = useTemplateStore((s) => s.getSchema);
  const stringified = getSchema();

  return <JSONOutput>{stringified}</JSONOutput>;
};

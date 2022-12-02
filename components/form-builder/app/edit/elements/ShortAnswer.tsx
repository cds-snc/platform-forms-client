import React from "react";
import styled from "styled-components";

const TextHint = styled.div`
  margin: 20px 5px;
  color: rgba(0, 0, 0, 0.55);
  border-bottom: 1px dotted rgba(0, 0, 0, 0.45);
`;

export const ShortAnswer = ({ children, ...props }: { children: string }) => {
  return <TextHint {...props}>{children}</TextHint>;
};

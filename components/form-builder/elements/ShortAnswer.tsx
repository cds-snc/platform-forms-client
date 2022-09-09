import React from "react";
import styled from "styled-components";

const TextHint = styled.div`
  margin: 20px 5px;
  color: rgba(0, 0, 0, 0.38);
  border-bottom: 1px dotted rgba(0, 0, 0, 0.38);
`;

export const ShortAnswer = () => {
  return <TextHint>Short Answer text</TextHint>;
};

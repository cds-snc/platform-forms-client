import React from "react";
import styled from "styled-components";

const CopyFormContentButton = styled.button`
  border: 2px solid #26374a;
  border-radius: 10px;
  background: #fff;
  padding: 10px 25px;
  margin: 10px 0 30px 0;
`;

export const DownloadCSV = () => {
  return <CopyFormContentButton>Download .csv</CopyFormContentButton>;
};

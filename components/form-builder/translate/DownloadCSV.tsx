import React from "react";
import styled from "styled-components";
import useTemplateStore from "../store/useTemplateStore";

const CopyFormContentButton = styled.button`
  border: 2px solid #26374a;
  border-radius: 10px;
  background: #fff;
  padding: 10px 25px;
  margin: 10px 0 30px 0;
`;

export const DownloadCSV = () => {
  const { form } = useTemplateStore();

  const generateCSV = () => {
    const data = [["description", "english", "french"]];

    data.push(["Form introduction - Title", form.titleEn, form.titleFr]);
  };

  return <CopyFormContentButton onClick={generateCSV}>Download .csv</CopyFormContentButton>;
};

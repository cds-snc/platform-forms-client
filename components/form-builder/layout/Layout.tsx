import React from "react";
import styled from "styled-components";
import { ElementPanel } from "../panel/ElementPanel";
import useTemplateStore from "../store/useTemplateStore";
import { Import } from "./Import";
import { Output } from "./Output";
import { RichTextEditor } from "../editor/RichTextEditor";

const Input = styled.input`
  padding: 22px 10px;
  width: 800px;
  border: 1.5px solid #000000;
  max-height: 36px;
  margin-bottom: 35px;
  border-radius: 4px;
`;

export const Layout = () => {
  const {
    updateField,
    form: { titleEn },
  } = useTemplateStore();

  return (
    <>
      <div>
        <RichTextEditor />
        <Input
          placeholder="Form Title"
          value={titleEn}
          onChange={(e) => {
            updateField("form.titleEn", e.target.value);
          }}
        />
      </div>
      <ElementPanel />
      <Import />
      <Output />
    </>
  );
};

export default Layout;

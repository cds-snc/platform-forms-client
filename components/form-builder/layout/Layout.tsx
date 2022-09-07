import React from "react";
import styled from "styled-components";
import { ElementPanel } from "../panel/ElementPanel";
import useTemplateStore from "../store/useTemplateStore";
import { Import } from "./Import";
import { Output } from "./Output";

const Input = styled.input`
  padding: 22px;
  width: 800px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  max-height: 36px;
  margin-bottom: 35px;
`;

export const Layout = () => {
  const {
    updateField,
    form: { titleEn },
  } = useTemplateStore();
  return (
    <>
      <div>
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

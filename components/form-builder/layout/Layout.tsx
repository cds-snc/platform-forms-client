import React from "react";
import styled from "styled-components";
import { ElementPanel } from "../panel/ElementPanel";
import useTemplateStore from "../store/useTemplateStore";
import { Import } from "./Import";
import { Output } from "./Output";
import { Preview } from "./Preview";

const Input = styled.input`
  padding: 22px 10px;
  width: 800px;
  border: 1.5px solid #000000;
  max-height: 36px;
  margin-bottom: 35px;
  border-radius: 4px;
`;

const Navigation = styled.div`
  width: 800px;
  text-align: center;
  margin: 20px 0;
`;

const Tab = styled.span`
  text-decoration: underline;
`;

export const Layout = () => {
  const {
    updateField,
    form: { titleEn },
  } = useTemplateStore();

  const [showTab, setShowTab] = React.useState("create");

  const handleClick = (tab: string) => {
    setShowTab(tab);
  };

  return (
    <>
      <Navigation>
        <Tab onClick={() => handleClick("create")}>Create</Tab> /{" "}
        <Tab onClick={() => handleClick("json")}>Json</Tab> /{" "}
        <Tab onClick={() => handleClick("preview")}>Preview</Tab>
      </Navigation>

      {showTab === "create" && (
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
        </>
      )}
      {showTab === "json" && (
        <>
          <Import />
          <Output />
        </>
      )}
      {showTab === "preview" && (
        <>
          <Preview />
        </>
      )}
    </>
  );
};

export default Layout;

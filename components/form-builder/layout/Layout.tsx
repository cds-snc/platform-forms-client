import React from "react";
import styled from "styled-components";
import { useTranslation } from "next-i18next";
import { ElementPanel } from "../panel/ElementPanel";
import useTemplateStore from "../store/useTemplateStore";
import { LocalizedFormProperties } from "../types";
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
  cursor: pointer;
`;

export const Layout = () => {
  const { lang, updateField, toggleLang, localizeField, form } = useTemplateStore();
  const { t } = useTranslation("form-builder");

  const [showTab, setShowTab] = React.useState("create");

  const handleClick = (tab: string) => {
    setShowTab(tab);
  };

  return (
    <>
      <Navigation>
        <Tab onClick={() => handleClick("create")}>{t("create")}</Tab> /{" "}
        <Tab onClick={() => handleClick("json")}>{t("json")}</Tab> /{" "}
        <Tab onClick={toggleLang}>{lang === "en" ? "Français" : "English"}</Tab> /{" "}
        <Tab onClick={() => handleClick("preview")}>{t("preview")}</Tab>
      </Navigation>

      {showTab === "create" && (
        <>
          <div>
            <Input
              placeholder={t("placeHolderFormTitle")}
              value={form[localizeField(LocalizedFormProperties.TITLE)]}
              onChange={(e) => {
                updateField(`form.${localizeField(LocalizedFormProperties.TITLE)}`, e.target.value);
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

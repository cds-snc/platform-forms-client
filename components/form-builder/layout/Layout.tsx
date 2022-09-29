import React from "react";
import styled from "styled-components";
import { useTranslation } from "next-i18next";
import { ElementPanel } from "../panel/ElementPanel";
import useTemplateStore from "../store/useTemplateStore";
import { LocalizedFormProperties } from "../types";
import { Save } from "./Save";
import { Start } from "./Start";
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

  &.start .start,
  &.create .create,
  &.preview .preview,
  &.save .save {
    font-weight: 700;
  }
`;

const Tab = styled.span`
  text-decoration: underline;
  cursor: pointer;
`;

export const Layout = () => {
  const { lang, updateField, toggleLang, localizeField, form } = useTemplateStore();
  const { t } = useTranslation("form-builder");

  const [showTab, setShowTab] = React.useState("start");

  const handleClick = (tab: string) => {
    setShowTab(tab);
  };

  return (
    <>
      <Navigation className={showTab}>
        <Tab className="start" onClick={() => handleClick("start")}>
          {t("start")}
        </Tab>{" "}
        /{" "}
        <Tab className="create" onClick={() => handleClick("create")}>
          {t("create")}
        </Tab>{" "}
        / <Tab onClick={toggleLang}>{lang === "en" ? "Français" : "English"}</Tab> /{" "}
        <Tab className="preview" onClick={() => handleClick("preview")}>
          {t("preview")}
        </Tab>{" "}
        /{" "}
        <Tab className="save" onClick={() => handleClick("save")}>
          {t("save")}
        </Tab>
      </Navigation>

      {showTab === "start" && <Start createForm={handleClick} />}
      {showTab === "create" && (
        <>
          <div>
            <h1>{t("title")}</h1>
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
      {showTab === "save" && <Save />}
      {showTab === "preview" && <Preview />}
    </>
  );
};

export default Layout;

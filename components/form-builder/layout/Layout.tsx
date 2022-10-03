import React from "react";
import styled from "styled-components";
import { useTranslation } from "next-i18next";
import { ElementPanel } from "../panel/ElementPanel";
import useTemplateStore from "../store/useTemplateStore";
import { LocalizedFormProperties } from "../types";
import { Save } from "./Save";
import { Start } from "./Start";
import { Preview } from "./Preview";

const StyledHeader = styled.h1`
  border-bottom: none;
  margin-bottom: 2rem;
`;

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
  const { updateField, toggleLang, localizeField, form } = useTemplateStore();
  const { t } = useTranslation("form-builder");

  const [showTab, setShowTab] = React.useState("start");

  const handleClick = (tab: string) => {
    setShowTab(tab);
  };

  const handleHeaderClick = (e: React.MouseEvent<HTMLElement>) => {
    if (e.detail === 2) {
      // double click
      toggleLang();
    }
  };
  /* eslint-disable */
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
        /{" "}
        <Tab className="preview" onClick={() => handleClick("preview")}>
          {t("preview")}
        </Tab>{" "}
        /{" "}
        <Tab className="save" onClick={() => handleClick("save")}>
          {t("save")}
        </Tab>
      </Navigation>

      {showTab === "start" && (
        <>
          <h1 onClick={handleHeaderClick}>{t("start")}</h1>
          <Start changeTab={handleClick} />
        </>
      )}
      {showTab === "create" && (
        <>
          <div>
            <h1 onClick={handleHeaderClick}>{t("title")}</h1>
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
      {showTab === "preview" && (
        <>
          <h1 onClick={handleHeaderClick}>{form[localizeField(LocalizedFormProperties.TITLE)]}</h1>
          <Preview />
        </>
      )}
      {showTab === "save" && (
        <>
          <StyledHeader onClick={handleHeaderClick}>{t("saveH1")}</StyledHeader>
          <Save />
        </>
      )}
    </>
  );
  /* eslint-enable */
};

export default Layout;

import React, { useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "next-i18next";
import { ElementPanel } from "../panel/ElementPanel";
import useTemplateStore from "../store/useTemplateStore";
import useNavigationStore from "../store/useNavigationStore";

import { Language, LocalizedFormProperties } from "../types";
import { Save } from "./Save";
import { Start } from "./Start";
import { Preview } from "./Preview";
import { Translate } from "../translate/Translate";

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
  &.translate .translate,
  &.save .save {
    font-weight: 700;
  }
`;

const Tab = styled.a`
  text-decoration: underline;
  cursor: pointer;
`;

const StyledPreviewWrapper = styled.div`
  border: 3px dashed blue;
  padding: 20px;
`;

export const Layout = () => {
  const { updateField, localizeField, form, setLang } = useTemplateStore();
  const { currentTab, setTab } = useNavigationStore();
  const { t, i18n } = useTranslation("form-builder");
  const locale = i18n.language as Language;

  const handleClick = (tab: string) => {
    return (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      setTab(tab);
    };
  };

  useEffect(() => {
    setLang(locale);
  }, [locale]);

  /* eslint-disable */
  return (
    <>
      <Navigation className={currentTab}>
        <Tab className="start" href="#" onClick={handleClick("start")}>
          {t("start")}
        </Tab>{" "}
        /{" "}
        <Tab className="create" href="#" onClick={handleClick("create")}>
          {t("design")}
        </Tab>{" "}
        /{" "}
        <Tab className="preview" href="#" onClick={handleClick("preview")}>
          {t("preview")}
        </Tab>{" "}
        /{" "}
        <Tab className="translate" href="#" onClick={handleClick("translate")}>
          {t("translate")}
        </Tab>{" "}
        /{" "}
        <Tab className="save" href="#" onClick={handleClick("save")}>
          {t("save")}
        </Tab>
      </Navigation>

      {currentTab === "start" && (
        <>
          <h1>{t("start")}</h1>
          <Start changeTab={setTab} />
        </>
      )}
      {currentTab === "create" && (
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
      {currentTab === "preview" && (
        <>
          <StyledPreviewWrapper>
            <h1>{form[localizeField(LocalizedFormProperties.TITLE)]}</h1>
            <Preview />
          </StyledPreviewWrapper>
        </>
      )}
      {currentTab === "translate" && (
        <>
          <h1>{t("translateTitle")}</h1>
          <Translate />
        </>
      )}
      {currentTab === "save" && (
        <>
          <StyledHeader>{t("saveH1")}</StyledHeader>
          <Save />
        </>
      )}
    </>
  );
  /* eslint-enable */
};

export default Layout;

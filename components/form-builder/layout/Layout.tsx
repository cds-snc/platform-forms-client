import React, { useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "next-i18next";
import { ElementPanel } from "../panel/ElementPanel";
import useTemplateStore from "../store/useTemplateStore";
import useNavigationStore from "../store/useNavigationStore";
import { LeftNavigation } from "./LeftNavigation";

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
    <main className="md:mx-8 lg:mx-16 xl:mx-32 xxl:mx-48 mx-64">
      <div className="grid grid-cols-12 gap-4">

        {currentTab !== "start" && <LeftNavigation currentTab={currentTab} handleClick={handleClick} />}

        {currentTab === "start" && (
          <div className="col-span-12">
            <Start changeTab={setTab} />
          </div>
        )}

        {currentTab === "create" && (
          <div className="col-start-3 col-span-10">
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
          </div>
        )}

        {currentTab === "preview" && (
          <div className="col-start-3 col-span-10">
            <StyledPreviewWrapper>
              <h1>{form[localizeField(LocalizedFormProperties.TITLE)]}</h1>
              <Preview />
            </StyledPreviewWrapper>
          </div>
        )}

        {currentTab === "translate" && (
          <div className="col-start-3 col-span-10">
            <h1>{t("translateTitle")}</h1>
            <Translate />
          </div>
        )}

        {currentTab === "save" && (
          <div className="col-start-3 col-span-10">
            <StyledHeader>{t("saveH1")}</StyledHeader>
            <Save />
          </div>
        )}

      </div>
    </main>
  );
  /* eslint-enable */
};

export default Layout;

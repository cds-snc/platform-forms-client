import React, { useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "next-i18next";
import { ElementPanel } from "../panel/ElementPanel";
import useTemplateStore from "../store/useTemplateStore";
import useNavigationStore from "../store/useNavigationStore";
import { LeftNavigation } from "./LeftNavigation";

import { Language, LocalizedFormProperties, TemplateSchema } from "../types";
import { Save } from "./Save";
import { Start } from "./Start";
import { Preview } from "./Preview";
import { Translate } from "../translate/Translate";
import { EditNavigation } from "./EditNavigation";
import { PreviewNavigation } from "./PreviewNavigation";
import { FormRecord } from "@lib/types";

const StyledHeader = styled.h1`
  border-bottom: none;
  margin-bottom: 2rem;
`;

const StyledPreviewWrapper = styled.div`
  border: 3px dashed blue;
  padding: 20px;
`;

type LayoutProps = {
  tab: string;
  initialForm: FormRecord | null;
};

export const Layout = ({ tab, initialForm }: LayoutProps) => {
  const { localizeField, form, setLang, importTemplate } = useTemplateStore();
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

  // Refactor later to pass tab prop as intial state to useNavigationStore();
  useEffect(() => {
    setTab(tab);
  }, [tab]);

  useEffect(() => {
    if (initialForm) {
      const typeRefactoredForm = { ...initialForm } as unknown as TemplateSchema;
      typeRefactoredForm.form.endPage = {
        descriptionEn: "",
        descriptionFr: "",
      };
      // typeRefactoredForm.form.elements = sortByLayout(typeRefactoredForm.form);
      importTemplate(typeRefactoredForm);
    }
  }, [initialForm]);

  /* eslint-disable */
  return (
    <main className="container--wet">
      <div className="grid grid-cols-12 gap-4">
        {currentTab !== "start" && (
          <LeftNavigation currentTab={currentTab} handleClick={handleClick} />
        )}

        {currentTab === "start" && (
          <div className="col-span-12">
            <Start changeTab={setTab} />
          </div>
        )}

        {currentTab === "create" && (
          <div className="col-start-4 col-span-9">
            <EditNavigation currentTab={currentTab} handleClick={handleClick} />
            <ElementPanel />
          </div>
        )}

        {currentTab === "preview" && (
          <div className="col-start-4 col-span-9">
            <PreviewNavigation currentTab={currentTab} handleClick={handleClick} />
            <StyledPreviewWrapper>
              <h1>{form[localizeField(LocalizedFormProperties.TITLE)]}</h1>
              <Preview />
            </StyledPreviewWrapper>
          </div>
        )}

        {currentTab === "translate" && (
          <div className="col-start-4 col-span-9">
            <EditNavigation currentTab={currentTab} handleClick={handleClick} />
            <Translate />
          </div>
        )}

        {currentTab === "save" && (
          <div className="col-start-4 col-span-9">
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

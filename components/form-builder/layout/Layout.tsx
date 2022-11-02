import React, { useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "next-i18next";
import { ElementPanel } from "../panel/ElementPanel";
import { useTemplateStore } from "../store/useTemplateStore";
import { useNavigationStore } from "../store/useNavigationStore";
import { LeftNavigation } from "./LeftNavigation";
import { useAllowPublish } from "../hooks/useAllowPublish";

import { Language, LocalizedFormProperties } from "../types";
import { Share } from "./Share";
import { Start } from "./Start";
import { Preview } from "./Preview";
import { Translate } from "../translate/Translate";
import { EditNavigation } from "./EditNavigation";
import { PreviewNavigation } from "./PreviewNavigation";
import { Publish } from "./Publish";
import { Settings } from "./Settings";
import { DataDeliveryInstructions } from "./DataDeliveryInstructions";

const StyledHeader = styled.h1`
  border-bottom: none;
  margin-bottom: 2rem;
`;

const StyledPreviewWrapper = styled.div`
  border: 3px dashed blue;
  padding: 20px;
`;

export const Layout = () => {
  const { localizeField, form, setLang } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    form: s.form,
    setLang: s.setLang,
  }));

  const { currentTab, setTab } = useNavigationStore((s) => ({
    currentTab: s.currentTab,
    setTab: s.setTab,
  }));

  const { userCanPublish } = useAllowPublish();

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

  const renderTab = (tab: string) => {
    switch (tab) {
      case "start":
        return (
          <div className="col-span-12">
            <Start changeTab={setTab} />
          </div>
        );
      case "create":
        return (
          <div className="col-start-4 col-span-9">
            <EditNavigation currentTab={currentTab} handleClick={handleClick} />
            <ElementPanel />
          </div>
        );
      case "preview":
        return (
          <div className="col-start-4 col-span-9">
            <PreviewNavigation currentTab={currentTab} handleClick={handleClick} />
            <StyledPreviewWrapper>
              <h1>{form[localizeField(LocalizedFormProperties.TITLE)]}</h1>
              <Preview isPreview={true} />
            </StyledPreviewWrapper>
          </div>
        );
      case "test-data-delivery":
        return (
          <div className="col-start-4 col-span-9">
            <PreviewNavigation currentTab={currentTab} handleClick={handleClick} />
            <h1 className="border-0 mb-0">Test your response delivery</h1>
            <DataDeliveryInstructions />
            <StyledPreviewWrapper>
              <Preview isPreview={false} />
            </StyledPreviewWrapper>
          </div>
        );
      case "translate":
        return (
          <div className="col-start-4 col-span-9">
            <EditNavigation currentTab={currentTab} handleClick={handleClick} />
            <Translate />
          </div>
        );
      case "share":
        return (
          <div className="col-start-4 col-span-9">
            <StyledHeader>{t("shareH1")}</StyledHeader>
            <Share />
          </div>
        );
      case "publish":
        return userCanPublish ? (
          <div className="col-start-4 col-span-9">
            <Publish />
          </div>
        ) : (
          setTab("create")
        );
      case "settings":
        return (
          <div className="col-start-4 col-span-9">
            <EditNavigation currentTab={currentTab} handleClick={handleClick} />
            <h1 className="visually-hidden">Form settings</h1>
            <Settings />
          </div>
        );
      default:
        return (
          <div className="col-span-12">
            <Start changeTab={setTab} />
          </div>
        );
    }
  };
  /* eslint-disable */
  return (
    <main className="container--wet">
      <div className="grid grid-cols-12 gap-4">
        {currentTab !== "start" && (
          <LeftNavigation currentTab={currentTab} handleClick={handleClick} />
        )}
        <>{form && renderTab(currentTab)}</>
      </div>
    </main>
  );
  /* eslint-enable */
};

export default Layout;

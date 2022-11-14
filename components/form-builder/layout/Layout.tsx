import React, { useEffect } from "react";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";
import { ElementPanel } from "../panel/ElementPanel";
import { useTemplateStore } from "../store/useTemplateStore";
import { useNavigationStore } from "../store/useNavigationStore";
import { LeftNavigation } from "./LeftNavigation";
import { Language } from "../types";
import { Share } from "./Share";
import { Start } from "./Start";
import { Preview } from "./Preview";
import { Translate } from "../translate/Translate";
import { EditNavigation } from "./EditNavigation";
import { PreviewNavigation } from "./PreviewNavigation";
import { Publish } from "./Publish";
import { Published } from "./Published";
import { Settings } from "./Settings";
import { TestDataDelivery } from "./TestDataDelivery";

export const Layout = () => {
  const { status } = useSession();
  const { form, setLang, email, updateField, id } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    form: s.form,
    id: s.id,
    setLang: s.setLang,
    email: s.submission.email,
    updateField: s.updateField,
  }));

  const { currentTab, setTab } = useNavigationStore((s) => ({
    currentTab: s.currentTab,
    setTab: s.setTab,
  }));

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

  const { data } = useSession();

  useEffect(() => {
    const setEmail = () => {
      if (data && data.user.email) {
        updateField("submission.email", data.user.email);
      }
    };
    !email && currentTab !== "settings" && setEmail();
  }, [email, data, currentTab]);

  const renderTab = (tab: string) => {
    switch (tab) {
      case "start":
        return (
          <main id="content" className="col-span-12">
            <Start changeTab={setTab} />
          </main>
        );
      case "create":
        return (
          <div className="col-start-4 col-span-9">
            <EditNavigation currentTab={currentTab} handleClick={handleClick} />
            <main id="content">
              <ElementPanel />
            </main>
          </div>
        );
      case "preview":
        return (
          <div className="col-start-4 col-span-9">
            <PreviewNavigation currentTab={currentTab} handleClick={handleClick} />
            <main id="content">
              <Preview />
            </main>
          </div>
        );
      case "test-data-delivery":
        return status === "authenticated" ? (
          <div className="col-start-4 col-span-9">
            <PreviewNavigation currentTab={currentTab} handleClick={handleClick} />
            <main id="content">
              <h1 className="border-0 mb-0">{t("testYourResponseDelivery")}</h1>
              <TestDataDelivery />
            </main>
          </div>
        ) : (
          setTab("create")
        );
      case "translate":
        return (
          <div className="col-start-4 col-span-9">
            <EditNavigation currentTab={currentTab} handleClick={handleClick} />
            <main id="content">
              <Translate />
            </main>
          </div>
        );
      case "share":
        return (
          <div className="col-start-4 col-span-9">
            <main id="content">
              <h1 className="border-b-0 mb-8">{t("shareH1")}</h1>
              <Share />
            </main>
          </div>
        );
      case "publish":
        return (
          <main id="content" className="col-start-4 col-span-9">
            <Publish />
          </main>
        );
      case "published":
        return status === "authenticated" ? (
          <main id="content" className="col-start-4 col-span-9">
            <Published id={id} />
          </main>
        ) : (
          setTab("create")
        );
      case "settings":
        return (
          <div className="col-start-4 col-span-9">
            <PreviewNavigation currentTab={currentTab} handleClick={handleClick} />
            <main id="content">
              <h1 className="visually-hidden">Form settings</h1>
              <Settings />
            </main>
          </div>
        );
      default:
        return (
          <main id="content" className="col-span-12">
            <Start changeTab={setTab} />
          </main>
        );
    }
  };
  /* eslint-disable */

  return (
    <div id="page-container">
      <div className="grid grid-cols-12 gap-4">
        {currentTab !== "start" && currentTab !== "published" && (
          <LeftNavigation currentTab={currentTab} handleClick={handleClick} />
        )}
        <>{form && renderTab(currentTab)}</>
      </div>
    </div>
  );
  /* eslint-enable */
};

export default Layout;

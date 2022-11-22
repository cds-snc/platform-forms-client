import React, { useEffect } from "react";
import Head from "next/head";
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
import { Save } from "./Save";

export const Layout = () => {
  const { status } = useSession();
  const { hasHydrated, form, setLang, email, updateField, id } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    form: s.form,
    id: s.id,
    setLang: s.setLang,
    email: s.submission?.email,
    updateField: s.updateField,
    hasHydrated: s._hasHydrated,
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
            <Head>
              <title>
                {t("gcFormsStart")} — {t("gcForms")}
              </title>
            </Head>
            <Start changeTab={setTab} />
          </main>
        );
      case "create":
        return (
          <div className="col-start-4 col-span-9">
            <Head>
              <title>
                {t("gcFormsEdit")} — {t("gcForms")}
              </title>
            </Head>
            <EditNavigation currentTab={currentTab} handleClick={handleClick} />
            <main id="content">
              <ElementPanel />
            </main>
          </div>
        );
      case "preview":
        return (
          <div className="col-start-4 col-span-9">
            <Head>
              <title>
                {t("gcFormsPreview")} — {t("gcForms")}
              </title>
            </Head>
            <PreviewNavigation currentTab={currentTab} handleClick={handleClick} />
            <main id="content">
              <Preview />
            </main>
          </div>
        );
      case "test-data-delivery":
        return status === "authenticated" ? (
          <div className="col-start-4 col-span-9">
            <Head>
              <title>
                {t("gcFormsResponseDelivery")} — {t("gcForms")}
              </title>
            </Head>
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
            <Head>
              <title>
                {t("gcFormsTranslate")} — {t("gcForms")}
              </title>
            </Head>
            <EditNavigation currentTab={currentTab} handleClick={handleClick} />
            <main id="content">
              <Translate />
            </main>
          </div>
        );
      case "share":
        return (
          <div className="col-start-4 col-span-9">
            <Head>
              <title>
                {t("gcFormsShare")} — {t("gcForms")}
              </title>
            </Head>
            <main id="content">
              <h1 className="border-b-0 mb-8">{t("shareH1")}</h1>
              <Share />
            </main>
          </div>
        );
      case "save":
        return (
          <div className="col-start-4 col-span-9">
            <Head>
              <title>
                {t("gcFormsSave")} — {t("gcForms")}
              </title>
            </Head>
            <main id="content">
              <h1 className="border-b-0 mb-8">{t("saveYourProgress")}</h1>
              <Save />
            </main>
          </div>
        );
      case "publish":
        return (
          <main id="content" className="col-start-4 col-span-9">
            <Head>
              <title>
                {t("gcFormsPublish")} — {t("gcForms")}
              </title>
            </Head>
            <Publish />
          </main>
        );
      case "published":
        return status === "authenticated" ? (
          <main id="content" className="col-start-4 col-span-9">
            <Head>
              <title>
                {t("gcFormsPublished")} — {t("gcForms")}
              </title>
            </Head>
            <Published id={id} />
          </main>
        ) : (
          setTab("create")
        );
      case "settings":
        return (
          <div className="col-start-4 col-span-9">
            <Head>
              <title>
                {t("gcFormsSettings")} — {t("gcForms")}
              </title>
            </Head>
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
  // Wait until the Template Store has fully hydrated before rendering the page
  return hasHydrated ? (
    <div className="xs:px-4 md:px-8 lg:px-16 px-32">
      <div className="flex">
        {currentTab !== "start" && currentTab !== "published" && (
          <LeftNavigation currentTab={currentTab} handleClick={handleClick} />
        )}
        <>{form && renderTab(currentTab)}</>
      </div>
    </div>
  ) : null;
  /* eslint-enable */
};

export default Layout;

import React, { useEffect } from "react";
import Head from "next/head";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";
import { useTemplateStore } from "../store/useTemplateStore";
import { useNavigationStore } from "../store/useNavigationStore";
import { LeftNavigation } from "./LeftNavigation";
import { Language } from "../types";
import { Share } from "./Share";
import { Start } from "./Start";
import { Preview } from "./Preview";
import { PreviewNavigation } from "./PreviewNavigation";
import { Published } from "./Published";
import { TestDataDelivery } from "./TestDataDelivery";
import { Loader } from "@components/globals/Loader";

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
      case "settings":
      case "edit":
      case "create":
      case "translate":
      case "save":
      case "publish":
        return <Loader message={t("loading")} />;
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
              <TestDataDelivery />
            </main>
          </div>
        ) : (
          setTab("create")
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
              <Share />
            </main>
          </div>
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
      default: // Start page
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
    }
  };
  /* eslint-disable */
  // Wait until the Template Store has fully hydrated before rendering the page
  return hasHydrated ? (
    <div id="page-container">
      <div className="grid grid-cols-12 gap-4">
        {currentTab && currentTab !== "start" && currentTab !== "published" && (
          <LeftNavigation currentTab={currentTab} handleClick={handleClick} />
        )}
        <>{form && renderTab(currentTab)}</>
      </div>
    </div>
  ) : <Loader message={t("loading")}></Loader>;
  /* eslint-enable */
};

export default Layout;

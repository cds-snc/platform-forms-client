import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getAllTemplates } from "@lib/templates";
import { requireAuthentication } from "@lib/auth";
import { checkPrivileges } from "@lib/privileges";

import React, { ReactElement, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { CardGrid } from "@components/myforms/CardGrid/CardGrid";
import { CardProps } from "@components/myforms/Card/Card";
import { TabsList } from "@components/myforms/Tabs/TabsList";
import { Tab } from "@components/myforms/Tabs/Tab";
import { TabPanel } from "@components/myforms/Tabs/TabPanel";
import UserNavLayout from "@components/globals/layouts/UserNavLayout";
import { NextPageWithLayout } from "@pages/_app";
import Link from "next/link";

interface FormsDataItem {
  id: string;
  titleEn: string;
  titleFr: string;
  url: string;
  date: string;
  isPublished: boolean;
}
interface MyFormsProps {
  templates: Array<FormsDataItem>;
}

const RenderMyForms: NextPageWithLayout<MyFormsProps> = ({ templates }: MyFormsProps) => {
  const router = useRouter();
  const path = String(router.query?.path);
  const { t, i18n } = useTranslation(["my-forms"]);

  const templatesAll = templates.sort((itemA, itemB) => {
    return new Date(itemB.date).getTime() - new Date(itemA.date).getTime();
  }) as Array<CardProps>;

  const templatesPublished = templatesAll?.filter(
    (item) => item?.isPublished === true
  ) as Array<CardProps>;

  const templatesDrafts = templatesAll?.filter(
    (item) => item?.isPublished === false
  ) as Array<CardProps>;

  useEffect(() => {
    // Default route is "published". Done here vs getServerSideProps to avoid extra data fetch
    const formStateRegex = /^(drafts|published|all)$/gi;
    if (!formStateRegex.test(String(path))) {
      router.push(`/${i18n.language}/myforms/drafts`, undefined, { shallow: true });
    }
  }, []);

  return (
    <div className="relative">
      <h1 id="title-myforms">{t("title")}</h1>
      <TabsList labeledby="title-myforms">
        <Tab
          url={`/${i18n.language}/myforms/drafts`}
          isActive={path === "drafts"}
          id="tab-drafts"
          tabpanelId="tabpanel-drafts"
        >
          {t("nav.drafts")}
        </Tab>
        <Tab
          url={`/${i18n.language}/myforms/published`}
          isActive={path === "published"}
          id="tab-published"
          tabpanelId="tabpanel-published"
        >
          {t("nav.published")}
        </Tab>
        <Tab
          url={`/${i18n.language}/myforms/all`}
          isActive={path === "all"}
          id="tab-all"
          tabpanelId="tabpanel-all"
        >
          {t("nav.all")}
        </Tab>
      </TabsList>
      <TabPanel id="tabpanel-drafts" labeledbyId="tab-drafts" isActive={path === "drafts"}>
        <CardGrid cards={templatesDrafts}></CardGrid>
      </TabPanel>
      <TabPanel id="tabpanel-published" labeledbyId="tab-published" isActive={path === "published"}>
        <CardGrid cards={templatesPublished}></CardGrid>
      </TabPanel>
      <TabPanel id="tabpanel-all" labeledbyId="tab-all" isActive={path === "all"}>
        <CardGrid cards={templatesAll}></CardGrid>
      </TabPanel>

      <div className="absolute top-48">
        <Link href="/form-builder/start" passHref>
          {/* The following is needed as jsx-ally cannot see the rendered a tag with the passed href*/}
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a>
            {t("actions.createNewForm")} <span aria-hidden="true">+</span>
          </a>
        </Link>
      </div>
    </div>
  );
};

RenderMyForms.getLayout = (page: ReactElement) => {
  return <UserNavLayout>{page}</UserNavLayout>;
};

export const getServerSideProps = requireAuthentication(
  async ({ user: { ability, id }, locale }) => {
    {
      checkPrivileges(ability, [{ action: "view", subject: "FormRecord" }]);

      const templates = (await getAllTemplates(ability, id)).map((template) => {
        const {
          id,
          form: { titleEn, titleFr },
          isPublished,
          updated_at,
        } = template;
        return {
          id,
          titleEn,
          titleFr,
          isPublished,
          date: updated_at,
          url: `/${locale}/id/${id}`,
        };
      });

      return {
        props: {
          templates,
          ...(locale && (await serverSideTranslations(locale, ["common", "my-forms"]))),
        },
      };
    }
  }
);

export default RenderMyForms;

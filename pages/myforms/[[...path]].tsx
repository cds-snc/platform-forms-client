import React, { ReactElement, useEffect, useRef } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import Head from "next/head";

import { getAllTemplates } from "@lib/templates";
import { requireAuthentication } from "@lib/auth";
import { checkPrivileges } from "@lib/privileges";

import { NextPageWithLayout } from "@pages/_app";
import { CardGrid } from "@components/myforms/CardGrid/CardGrid";
import { TabPanel } from "@components/myforms/Tabs/TabPanel";
import { LeftNavigation } from "@components/myforms/LeftNav";
import { StyledLink } from "@components/globals/StyledLink/StyledLink";
import { clearTemplateStore } from "@components/form-builder/store/useTemplateStore";
import { ResumeEditingForm } from "@components/form-builder/app/shared";
import { Template } from "@components/form-builder/app";
import { getUnprocessedSubmissionsForUser } from "@lib/users";

interface FormsDataItem {
  id: string;
  titleEn: string;
  titleFr: string;
  url: string;
  date: string;
  name: string;
  deliveryOption: { emailAddress?: string };
  isPublished: boolean;
  overdue: number;
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
  });

  const templatesPublished = templatesAll?.filter((item) => item?.isPublished === true);

  const templatesDrafts = templatesAll?.filter((item) => item?.isPublished === false);

  const createNewFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Default route is "drafts". Done here vs getServerSideProps to avoid extra data fetch
    const formStateRegex = /^(drafts|published|all)$/gi;
    if (!formStateRegex.test(String(path))) {
      router.push(`/${i18n.language}/myforms/drafts`, undefined, { shallow: true });
    }
    // purposely not including router in the dependency array
    // effect should re-fire only when path changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  useEffect(() => {
    const handleClick = () => {
      clearTemplateStore();
    };

    const element = createNewFormRef.current;

    if (element !== null) element.addEventListener("click", handleClick);

    return () => {
      if (element !== null) element.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <div className="mx-4 laptop:mx-32 desktop:mx-64 grow shrink-0 basis-auto">
        <div>
          <LeftNavigation />
          <main id="content" className="ml-40 laptop:ml-60">
            <h1 className="border-b-0 mb-8 text-h1">{t("title")}</h1>
            <div className="top-40">
              <ResumeEditingForm>
                <StyledLink href="/form-builder/edit" className="mr-8">
                  <span aria-hidden="true"> ← </span> {t("actions.resumeForm")}
                </StyledLink>
              </ResumeEditingForm>
              <div ref={createNewFormRef} className="inline">
                <StyledLink href="/form-builder">
                  <span aria-hidden="true">+</span> {t("actions.createNewForm")}
                </StyledLink>
              </div>
            </div>
            <TabPanel id="tabpanel-drafts" labeledbyId="tab-drafts" isActive={path === "drafts"}>
              {templatesDrafts && templatesDrafts?.length > 0 ? (
                <CardGrid cards={templatesDrafts}></CardGrid>
              ) : (
                <p>{t("cards.noDraftForms")}</p>
              )}
            </TabPanel>
            <TabPanel
              id="tabpanel-published"
              labeledbyId="tab-published"
              isActive={path === "published"}
            >
              {templatesPublished && templatesPublished?.length > 0 ? (
                <CardGrid cards={templatesPublished}></CardGrid>
              ) : (
                <p>{t("cards.noPublishedForms")}</p>
              )}
            </TabPanel>
            <TabPanel id="tabpanel-all" labeledbyId="tab-all" isActive={path === "all"}>
              {templatesAll && templatesAll?.length > 0 ? (
                <CardGrid cards={templatesAll}></CardGrid>
              ) : (
                <p>{t("cards.noForms")}</p>
              )}
            </TabPanel>
          </main>
        </div>
      </div>
    </>
  );
};

RenderMyForms.getLayout = (page: ReactElement) => {
  return <Template page={page} className="my-forms"></Template>;
};

export const getServerSideProps = requireAuthentication(
  async ({ user: { ability, id }, locale }) => {
    {
      checkPrivileges(ability, [{ action: "view", subject: "FormRecord" }]);

      const templates = (await getAllTemplates(ability, id)).map((template) => {
        const {
          id,
          form: { titleEn = "", titleFr = "" },
          name,
          deliveryOption = { emailAddress: "" },
          isPublished,
          updatedAt,
        } = template;
        return {
          id,
          titleEn,
          titleFr,
          deliveryOption,
          name,
          isPublished,
          date: updatedAt,
          url: `/${locale}/id/${id}`,
          overdue: 0,
        };
      });

      const overdue = await getUnprocessedSubmissionsForUser(ability, id);

      templates.map((template) => {
        if (overdue[template.id]) {
          template.overdue = overdue[template.id].numberOfSubmissions;
        }
      });

      return {
        props: {
          templates,
          ...(locale &&
            (await serverSideTranslations(locale, ["my-forms", "common", "form-builder"]))),
        },
      };
    }
  }
);

export default RenderMyForms;

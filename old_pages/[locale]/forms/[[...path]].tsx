import React, { ReactElement, useEffect, useRef } from "react";
import { serverTranslation } from "@i18n";
import { useTranslation } from "@i18n/client"
import { useRouter } from "next/navigation";

import { getAllTemplates } from "@lib/templates";
import { requireAuthentication } from "@lib/auth";
import { checkPrivileges } from "@lib/privileges";
import { FilterNavigation } from "@clientComponents/myforms/FilterNav/FilterNavigation";
import { LinkButton } from "@clientComponents/globals";

import { NextPageWithLayout } from "old_pages/_app";
import { CardGrid } from "@clientComponents/myforms/CardGrid/CardGrid";
import { TabPanel } from "@clientComponents/myforms/Tabs/TabPanel";
import { StyledLink } from "@clientComponents/globals/StyledLink/StyledLink";
import {
  TemplateStoreProvider,
  clearTemplateStore,
} from "@clientComponents/form-builder/store/useTemplateStore";
import { ResumeEditingForm } from "@clientComponents/form-builder/app/shared";
import { getUnprocessedSubmissionsForUser } from "@lib/users";
import { FullWidthLayout } from "@clientComponents/globals/layouts";
import Head from "next/head";

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
  const { t } = useTranslation(["my-forms"]);

  const templatesAll = templates.sort((itemA, itemB) => {
    return new Date(itemB.date).getTime() - new Date(itemA.date).getTime();
  });

  const templatesPublished = templatesAll?.filter((item) => item?.isPublished === true);

  const templatesDrafts = templatesAll?.filter((item) => item?.isPublished === false);

  const createNewFormRef = useRef<HTMLDivElement>(null);

  const css = `
    body {
       background-color: #F9FAFB;
    }
`;

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
        <style>{css}</style>
      </Head>

      <div className="center mx-auto w-[980px]">
        <h1 className="mb-8 border-b-0">{t("title")}</h1>

        <div className="flex w-full justify-between">
          <FilterNavigation />
          <div ref={createNewFormRef} className="inline">
            <LinkButton.Primary href="/form-builder">
              <>
                <span aria-hidden="true" className="mr-2 inline-block">
                  +
                </span>{" "}
                {t("actions.createNewForm")}
              </>
            </LinkButton.Primary>
          </div>
        </div>

        <ResumeEditingForm>
<<<<<<<< HEAD:pages/[locale]/myforms/[[...path]].tsx
          <StyledLink href={`/${i18n.language}/form-builder/edit`} className="mr-8">
            <span aria-hidden="true"> ← </span> {t("actions.resumeForm")}
          </StyledLink>
        </ResumeEditingForm>
        <div ref={createNewFormRef} className="inline">
          <StyledLink href={`/${i18n.language}/form-builder`}>
            <span aria-hidden="true">+</span> {t("actions.createNewForm")}
          </StyledLink>
========
          <StyledLink href="/form-builder/edit" className="mb-4 inline-block">
            <span aria-hidden="true"> ← </span> {t("actions.resumeForm")}
          </StyledLink>
        </ResumeEditingForm>

        <div aria-live="polite">
          <TabPanel id="tabpanel-drafts" labeledbyId="tab-drafts" isActive={path === "drafts"}>
            {templatesDrafts && templatesDrafts?.length > 0 ? (
              <CardGrid cards={templatesDrafts} gridType="drafts"></CardGrid>
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
              <CardGrid cards={templatesPublished} gridType="published"></CardGrid>
            ) : (
              <p>{t("cards.noPublishedForms")}</p>
            )}
          </TabPanel>
          <TabPanel
            id="tabpanel-all"
            labeledbyId="tab-all"
            isActive={path === "all" || path === "undefined"}
          >
            {templatesAll && templatesAll?.length > 0 ? (
              <CardGrid cards={templatesAll} gridType="all"></CardGrid>
            ) : (
              <p>{t("cards.noForms")}</p>
            )}
          </TabPanel>
>>>>>>>> develop:pages/forms/[[...path]].tsx
        </div>
      </div>
    </>
  );
};

RenderMyForms.getLayout = (page: ReactElement) => {
  return (
    <TemplateStoreProvider
      {...{ ...(page.props.initialForm && page.props.initialForm), locale: page.props.locale }}
    >
      <FullWidthLayout>{page}</FullWidthLayout>
    </TemplateStoreProvider>
  );
};

export const getServerSideProps = requireAuthentication(
  async ({ user: { ability, id }, params }) => {
    const { locale = "en" }: { locale?: string } = params ?? {};
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

      templates.forEach((template) => {
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

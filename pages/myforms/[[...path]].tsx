import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getAllTemplates } from "@lib/templates";
import Link from "next/link";
import { requireAuthentication } from "@lib/auth";
import { checkPrivileges } from "@lib/privileges";

import React, { ReactElement, useEffect, useRef } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { CardGrid } from "@components/myforms/CardGrid/CardGrid";
import { CardProps } from "@components/myforms/Card/Card";
import { TabPanel } from "@components/myforms/Tabs/TabPanel";
import { StyledLink } from "@components/globals/StyledLink/StyledLink";
import { clearTemplateStore } from "@components/form-builder/store/useTemplateStore";
import { ResumeEditingForm } from "@components/form-builder/app/shared";
import { Template } from "@components/form-builder/app";
import { SaveIcon } from "@components/form-builder/icons";
import { NextPageWithLayout } from "@pages/_app";

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

const LeftNavLink = ({
  children,
  href,
  id,
  isActive,
}: {
  children: ReactElement;
  href: string;
  id: string;
  isActive: boolean;
}) => {
  return (
    <Link href={href} id={id}>
      <a
        href={href}
        className={`${
          isActive ? "font-bold" : ""
        } group xl:text-center no-underline rounded block xl:w-36 xl:pb-0 xl:pt-2 xl:mb-2 mb-4 -ml-1 pl-1 pr-2 md:pr-0 text-black-default hover:text-blue-hover visited:text-black-default focus:text-white-default focus:bg-blue-hover active:no-underline active:bg-blue-hover active:text-white-default`}
      >
        {children}
      </a>
    </Link>
  );
};

export const LeftNavigation = () => {
  const { t, i18n } = useTranslation(["my-forms"]);
  const router = useRouter();
  const path = String(router.query?.path);

  const iconClassname =
    "inline-block w-6 h-6 xl:block xl:mx-auto group-hover:fill-blue-hover group-focus:fill-white-default group-active:fill-white-default mr-2 -mt-1";

  return (
    <nav className="absolute xl:content-center" aria-label={t("navLabelFormBuilder")}>
      <LeftNavLink
        id="tab-drafts"
        href={`/${i18n.language}/myforms/drafts`}
        isActive={path === "drafts"}
      >
        <>
          <SaveIcon className={iconClassname} />
          {t("nav.drafts")}
        </>
      </LeftNavLink>

      <LeftNavLink
        id="tab-published"
        href={`/${i18n.language}/myforms/published`}
        isActive={path === "published"}
      >
        <>
          <SaveIcon className={iconClassname} />
          {t("nav.published")}
        </>
      </LeftNavLink>

      <LeftNavLink id="tab-all" href={`/${i18n.language}/myforms/all`} isActive={path === "all"}>
        <>
          <SaveIcon className={iconClassname} />
          {t("nav.all")}
        </>
      </LeftNavLink>
    </nav>
  );
};

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

  const createNewFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Default route is "drafts". Done here vs getServerSideProps to avoid extra data fetch
    const formStateRegex = /^(drafts|published|all)$/gi;
    if (!formStateRegex.test(String(path))) {
      router.push(`/${i18n.language}/myforms/drafts`, undefined, { shallow: true });
    }
  }, [router.query?.path]);

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
    <div id="page-container" className="lg:!mx-4 xl:!mx-8">
      <div>
        <LeftNavigation />

        <main id="content" className="ml-60 xl:ml-40 md:pl-5 max-w-4xl">
          <h1 className="border-b-0 mb-8 md:text-h1">{t("title")}</h1>

          <div className="top-40">
            <ResumeEditingForm>
              <StyledLink href="/form-builder/edit">
                <span aria-hidden="true"> ← </span> {t("actions.resumeForm")}
              </StyledLink>
            </ResumeEditingForm>
            <div ref={createNewFormRef} className="inline ml-8">
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
  );
};

RenderMyForms.getLayout = (page: ReactElement) => {
  return <Template page={page}></Template>;
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

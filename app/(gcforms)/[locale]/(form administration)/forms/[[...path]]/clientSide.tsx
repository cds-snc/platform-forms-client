"use client";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "@i18n/client";
import { usePathname } from "next/navigation";

import { FilterNavigation } from "@clientComponents/myforms/FilterNav/FilterNavigation";
import { LinkButton } from "@clientComponents/globals";
import { CardGrid } from "@clientComponents/myforms/CardGrid/CardGrid";
import { TabPanel } from "@clientComponents/myforms/Tabs/TabPanel";
import { StyledLink } from "@clientComponents/globals/StyledLink/StyledLink";
import { clearTemplateStore } from "@clientComponents/form-builder/store/useTemplateStore";
import { ResumeEditingForm } from "@clientComponents/form-builder/app/shared";
import { logMessage } from "@lib/logger";

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

export default function RenderMyForms({ templates }: MyFormsProps) {
  // remove locale from path and get sub-route
  const path = usePathname()?.split("/")[3];
  logMessage.debug(`path: ${path}`);

  const {
    t,
    i18n: { language },
  } = useTranslation(["my-forms"]);

  const templatesAll = templates.sort((itemA, itemB) => {
    return new Date(itemB.date).getTime() - new Date(itemA.date).getTime();
  });

  const templatesPublished = templatesAll?.filter((item) => item?.isPublished === true);

  const templatesDrafts = templatesAll?.filter((item) => item?.isPublished === false);

  const createNewFormRef = useRef<HTMLDivElement>(null);

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
    <div className="center mx-auto w-[980px]">
      <h1 className="mb-8 border-b-0">{t("title")}</h1>

      <div className="flex w-full justify-between">
        <FilterNavigation />
        <div ref={createNewFormRef} className="inline">
          <LinkButton.Primary href={`/${language}/form-builder`}>
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
        <StyledLink href={`/${language}/form-builder/edit`} className="mb-4 inline-block">
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
          isActive={path === "all" || typeof path === "undefined"}
        >
          {templatesAll && templatesAll?.length > 0 ? (
            <CardGrid cards={templatesAll} gridType="all"></CardGrid>
          ) : (
            <p>{t("cards.noForms")}</p>
          )}
        </TabPanel>
      </div>
    </div>
  );
}

"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { SubNavLink } from "@clientComponents/globals/SubNavLink";
import { useActivePathname } from "@lib/hooks/form-builder/useActivePathname";
import { LangSwitcher } from "@formBuilder/components/shared/LangSwitcher";
import { QuestionsIcon, TranslateIcon } from "@serverComponents/icons";
import { useTemplateStore } from "@lib/store/useTemplateStore";

export const EditNavigation = ({ id }: { id: string }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("form-builder");
  const { activePathname } = useActivePathname();
  const { id: storeId } = useTemplateStore((s) => ({
    id: s.id,
  }));
  const formId = storeId && storeId !== id ? storeId : id;
  return (
    <div className="tablet:flex-row relative flex max-w-[800px] flex-col">
      <div className="flex">
        <nav className="laptop:mb-4 flex flex-wrap" aria-label={t("navLabelEditor")}>
          <SubNavLink href={`/${language}/form-builder/${formId}/edit`}>
            <span className="laptop:text-base text-sm">
              <QuestionsIcon className="laptop:mt-[-2px] mr-2 inline-block" />
              {t("questions")}
            </span>
          </SubNavLink>
          <SubNavLink href={`/${language}/form-builder/${formId}/edit/translate`}>
            <span className="laptop:text-base text-sm">
              <TranslateIcon className="laptop:mt-[-2px] mr-2 inline-block" />
              {t("translate")}
            </span>
          </SubNavLink>
        </nav>
      </div>

      {activePathname.endsWith("/edit") && (
        <div className="tablet:absolute tablet:right-0 tablet:top-0 tablet:mt-1 flex">
          <LangSwitcher descriptionLangKey="editingIn" />
        </div>
      )}
    </div>
  );
};

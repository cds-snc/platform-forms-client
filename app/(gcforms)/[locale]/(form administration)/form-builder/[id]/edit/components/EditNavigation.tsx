"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { SubNavLink } from "@clientComponents/globals/SubNavLink";
import { useActivePathname } from "@lib/hooks/form-builder";
import { LangSwitcher } from "@formBuilder/components/shared/LangSwitcher";
import { QuestionsIcon, TranslateIcon } from "@serverComponents/icons";
import { useTemplateStore } from "@lib/store";

export const EditNavigation = ({ id }: { id: string }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("form-builder");
  const { activePathname } = useActivePathname();
  const { id: storeId } = useTemplateStore((s) => ({
    id: s.id,
  }));
  if (storeId && storeId !== id) {
    id = storeId;
  }
  return (
    <div className="relative flex max-w-[800px] flex-col tablet:flex-row">
      <div className="flex">
        <div className="hidden">
          <nav className="flex flex-wrap laptop:mb-4" aria-label={t("navLabelEditor")}>
            <SubNavLink href={`/${language}/form-builder/${id}/edit`}>
              <span className="text-sm laptop:text-base">
                <QuestionsIcon className="mr-2 inline-block laptop:mt-[-2px]" />
                {t("questions")}
              </span>
            </SubNavLink>
            <SubNavLink href={`/${language}/form-builder/${id}/edit/translate`}>
              <span className="text-sm laptop:text-base">
                <TranslateIcon className="mr-2 inline-block laptop:mt-[-2px]" />
                {t("translate")}
              </span>
            </SubNavLink>
          </nav>
        </div>
      </div>
      <div className="hidden">
        {activePathname.endsWith("/edit") && (
          <div className="flex tablet:absolute tablet:right-0 tablet:top-0 tablet:mt-1">
            <LangSwitcher descriptionLangKey="editingIn" />
          </div>
        )}
      </div>
    </div>
  );
};

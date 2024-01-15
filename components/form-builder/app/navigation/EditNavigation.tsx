import React from "react";
import { useTranslation } from "next-i18next";
import { SubNavLink } from "./SubNavLink";
import { useActivePathname } from "@components/form-builder/hooks";
import { LangSwitcher } from "../shared/LangSwitcher";
import { QuestionsIcon, TranslateIcon } from "@components/form-builder/icons";

export const EditNavigation = () => {
  const { t } = useTranslation("form-builder");
  const { activePathname } = useActivePathname();
  return (
    <div className="relative flex max-w-[800px] flex-col tablet:flex-row">
      <div className="flex">
        <nav className="flex flex-wrap laptop:mb-4" aria-label={t("navLabelEditor")}>
          <SubNavLink href="/form-builder/edit">
            <span className="text-sm laptop:text-base">
              <QuestionsIcon className="mr-2 inline-block laptop:mt-[-2px]" />
              {t("questions")}
            </span>
          </SubNavLink>
          <SubNavLink href="/form-builder/edit/translate">
            <span className="text-sm laptop:text-base">
              <TranslateIcon className="mr-2 inline-block laptop:mt-[-2px]" />
              {t("translate")}
            </span>
          </SubNavLink>
        </nav>
      </div>
      <div>
        {activePathname.endsWith("/edit") && (
          <div className="flex tablet:absolute tablet:right-0 tablet:top-0 tablet:mt-4">
            <LangSwitcher descriptionLangKey="editingIn" />
          </div>
        )}
      </div>
    </div>
  );
};

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
    <div className="relative flex flex-col laptop:flex-row laptop:mb-8 laptop:relative">
      <div className="flex">
        <nav className="flex" aria-label={t("navLabelEditor")}>
          <SubNavLink href="/form-builder/edit">
            <span>
              <QuestionsIcon className="hidden laptop:inline-block laptop:mt-[-2px] laptop:mr-2" />
              {t("questions")}
            </span>
          </SubNavLink>
          <SubNavLink href="/form-builder/edit/translate">
            <span>
              <TranslateIcon className="hidden laptop:inline-block laptop:mt-[-2px] laptop:mr-2" />
              {t("translate")}
            </span>
          </SubNavLink>
        </nav>
      </div>
      <div>
        {activePathname.endsWith("/edit") && (
          <div className="flex justify-end laptop:absolute laptop:right-0 laptop:top-0 laptop:mt-4 laptop:mr-[70px] desktop:mr-24">
            <LangSwitcher descriptionLangKey="editingIn" />
          </div>
        )}
      </div>
    </div>
  );
};

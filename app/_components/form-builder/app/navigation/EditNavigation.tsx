import React from "react";
import { useTranslation } from "next-i18next";
import { SubNavLink } from "./SubNavLink";
import { useActivePathname } from "@appComponents/form-builder/hooks";
import { LangSwitcher } from "../shared/LangSwitcher";
import { QuestionsIcon, TranslateIcon } from "@appComponents/form-builder/icons";

export const EditNavigation = () => {
  const { t } = useTranslation("form-builder");
  const { activePathname } = useActivePathname();

  return (
    <div className="relative flex flex-col tablet:flex-row max-w-[800px]">
      <div className="flex">
        <nav className="laptop:mb-4 flex flex-wrap" aria-label={t("navLabelEditor")}>
          <SubNavLink href="/form-builder/edit">
            <span className="text-sm laptop:text-base">
              <QuestionsIcon className="inline-block laptop:mt-[-2px] mr-2" />
              {t("questions")}
            </span>
          </SubNavLink>
          <SubNavLink href="/form-builder/edit/translate">
            <span className="text-sm laptop:text-base">
              <TranslateIcon className="inline-block laptop:mt-[-2px] mr-2" />
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

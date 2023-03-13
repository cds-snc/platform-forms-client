import React from "react";
import { useTranslation } from "next-i18next";
import { SubNavLink } from "./SubNavLink";
import { useActivePathname } from "@components/form-builder/hooks";
import { LangSwitcher } from "../shared/LangSwitcher";
import { QuestionsIcon, TranslateIcon } from "@components/form-builder/icons";

export const EditNavigation = () => {
  const { t } = useTranslation("form-builder");
  const { activePathname } = useActivePathname();

  const svgFill =
    "[&_svg]:focus:fill-white [&_svg]:hover:fill-white hover:bg-gray-600 hover:!text-white-default";
  const svgStroke =
    "[&_svg]:focus:stroke-white [&_svg]:hover:stroke-white hover:bg-gray-600 hover:!text-white-default";

  return (
    <div className="relative flex">
      <div className="flex justify-content:space-between">
        <nav className="mb-8 flex " aria-label={t("navLabelEditor")}>
          <SubNavLink
            href="/form-builder/edit"
            className={`!text-black focus:!text-white ${svgFill} `}
            activeClassName="[&_svg]:fill-white"
          >
            <span>
              <QuestionsIcon className="inline-block mt-[-2px] mr-3" />
              {t("questions")}
            </span>
          </SubNavLink>
          <SubNavLink
            href="/form-builder/edit/translate"
            className={`[&_svg]:stroke-black !text-black focus:!text-white ${svgStroke}`}
            activeClassName={`[&_svg]:stroke-white ${svgStroke} focus:text-white`}
          >
            <span>
              <TranslateIcon className="inline-block mt-[-2px] mr-2" />
              {t("translate")}
            </span>
          </SubNavLink>
        </nav>
      </div>
      <div>
        {activePathname.endsWith("/edit") && (
          <div className="absolute right-0 mr-24 top-0">
            <LangSwitcher descriptionLangKey="editingIn" />
          </div>
        )}
      </div>
    </div>
  );
};

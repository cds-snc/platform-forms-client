import { serverTranslation } from "@i18n";
import { LogicSectionArrowIcon } from "@serverComponents/icons/LogicSectionArrowIcon";
import { LogicOptionArrowIcon } from "@serverComponents/icons/LogicOptionArrowIcon";
import { Language } from "@lib/types/form-builder-types";

export const Legend = async ({ lang }: { lang: Language }) => {
  const { t } = await serverTranslation("form-builder", { lang });
  return (
    <div className="my-6">
      <div className="text-base italic">
        <span className="inline-block pr-4">
          <LogicSectionArrowIcon />
        </span>
        {t("logic.legend.section")}
      </div>
      <div className="text-base italic">
        <span className="inline-block pr-4">
          <LogicOptionArrowIcon className="inline-block" />
        </span>
        {t("logic.legend.option")}
      </div>
    </div>
  );
};

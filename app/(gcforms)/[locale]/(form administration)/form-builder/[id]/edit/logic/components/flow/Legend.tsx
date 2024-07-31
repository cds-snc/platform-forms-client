import { serverTranslation } from "@i18n";
import { LogicSectionArrowIcon } from "@serverComponents/icons/LogicSectionArrowIcon";
import { LogicOptionArrowIcon } from "@serverComponents/icons/LogicOptionArrowIcon";
import { Language } from "@lib/types/form-builder-types";

export const Legend = async ({ lang }: { lang: Language }) => {
  const { t } = await serverTranslation("form-builder", { lang });
  return (
    <div className="my-6">
      <div className="mb-4 flex text-base italic">
        <span className="inline-block pr-4">
          <LogicOptionArrowIcon className="inline-block" />
        </span>
        <span className="inline-block">{t("logic.legend.option")}</span>
      </div>
      <div className="flex text-base italic">
        <span className="inline-block pr-4">
          <LogicSectionArrowIcon />
        </span>
        <span className="inline-block">{t("logic.legend.page")}</span>
      </div>
    </div>
  );
};

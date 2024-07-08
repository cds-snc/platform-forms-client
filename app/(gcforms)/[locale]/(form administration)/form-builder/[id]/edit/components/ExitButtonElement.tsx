import { useTranslation } from "@i18n/client";
import Brand from "@clientComponents/globals/Brand";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { Language } from "@lib/types/form-builder-types";
import { useState } from "react";

export const ExitButtonElement = ({
  groupId,
  exitButtonUrl,
}: {
  groupId: string;
  exitButtonUrl: string;
}) => {
  const { t } = useTranslation("form-builder");

  /*--------------------------------------------*
   * Current store values
   *--------------------------------------------*/
  const { brand, getLocalizationAttribute } = useTemplateStore((s) => ({
    brand: s.form?.brand,
    getLocalizationAttribute: s.getLocalizationAttribute,
  }));

  const [value, setValue] = useState(exitButtonUrl);

  const language = getLocalizationAttribute()?.lang as Language;

  const setExitButtonUrl = useGroupStore((state) => state.setExitButtonUrl);

  const handleOnBlur = () => {
    setExitButtonUrl({ id: groupId, locale: language || "en", url: value || "" });
  };

  return (
    <div className="mt-8">
      <p className="mb-4">{t("logic.exitButtonElement.description")}</p>
      <p className="font-bold">{t("logic.exitButtonElement.list.title")}</p>
      <ul className="mb-6">
        <li>{t("logic.exitButtonElement.list.item1")}</li>
        <li>{t("logic.exitButtonElement.list.item2")}</li>
        <li>{t("logic.exitButtonElement.list.item3")}</li>
      </ul>
      <div>
        <p className="mb-4">{t("logic.exitButtonElement.buttonDescription")}</p>
        <div className="mb-4">
          <Brand brand={brand} />
        </div>
        <label className="mb-4 inline-block">{t("logic.exitButtonElement.buttonLabel")}</label>
        <div className="mb-4">
          <input
            onBlur={handleOnBlur}
            onChange={(e) => setValue(e.target.value)}
            value={value}
            placeholder={"https://"}
            className="w-full overflow-y-visible rounded-sm border-2 border-solid border-slate-500 p-2 focus:bg-gray-default focus:outline-0"
          />
        </div>
      </div>
    </div>
  );
};

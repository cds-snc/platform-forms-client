import { useTranslation } from "@i18n/client";

import { Description, Label } from "@clientComponents/forms";

export const CustomJson = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div>
      <h3 className="mb-0">{t("addElementDialog.customJson.title")}</h3>
      <p>{t("addElementDialog.customJson.description")}</p>
      <div
        className={
          "gcds-textarea-wrapper relative mt-4 rounded-lg border border-slate-400 bg-white p-4"
        }
      >
        <div className="mt-4">
          <Label htmlFor="custom-elements" className="gc-label">
            {t("addElementDialog.customJson.field.label")}
          </Label>
          <Description>{t("addElementDialog.customJson.field.description")}</Description>
          <textarea id="custom-elements" className="gcds-textarea h-[200px]"></textarea>
        </div>
      </div>
    </div>
  );
};

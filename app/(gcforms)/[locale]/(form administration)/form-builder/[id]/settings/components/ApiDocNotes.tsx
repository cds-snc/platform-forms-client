import { Trans } from "react-i18next";
import { useTranslation } from "@i18n/client";

export const ApiDocNotes = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div className="mb-12 w-3/5">
      <p className="font-bold">{t("formSettingsModal.apiDocNotes.title")}</p>
      <Trans
        ns="form-builder"
        i18nKey="formSettingsModal.apiDocNotes.text1"
        defaults="<strong></strong> <a></a>"
        components={{ strong: <strong />, a: <a /> }}
      />
    </div>
  );
};

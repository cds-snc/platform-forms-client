import { Trans } from "react-i18next";
import { useTranslation } from "@i18n/client";

export const ResponsibilityList = () => {
  const { t } = useTranslation("form-builder");
  return (
    <>
      <p className="font-bold">{t("settings.api.dialog.responsibility")}</p>
      <ul className="mb-4">
        <li>
          <Trans
            ns="form-builder"
            i18nKey="settings.api.dialog.responsibility1"
            defaults="<strong></strong> <a></a>"
            components={{ strong: <strong />, a: <a /> }}
          />
        </li>
        <li>
          <Trans
            ns="form-builder"
            i18nKey="settings.api.dialog.responsibility2"
            defaults="<strong></strong> <a></a>"
            components={{ strong: <strong />, a: <a /> }}
          />
        </li>
        <li>
          <Trans
            ns="form-builder"
            i18nKey="settings.api.dialog.responsibility3"
            defaults="<strong></strong> <a></a>"
            components={{ strong: <strong />, a: <a /> }}
          />
        </li>
        <li>
          <Trans
            ns="form-builder"
            i18nKey="settings.api.dialog.responsibility4"
            defaults="<strong></strong> <a></a>"
            components={{ strong: <strong />, a: <a /> }}
          />
        </li>
      </ul>
    </>
  );
};

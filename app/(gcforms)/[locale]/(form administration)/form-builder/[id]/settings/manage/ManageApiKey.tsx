"use client";
import { useTranslation } from "@i18n/client";
import { ApiKeyButton } from "../components/ApiKeyButton";
import { SettingsApplicationsIcon } from "@serverComponents/icons";
export const ManageApiKey = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div className="mb-10">
      <h2>
        <SettingsApplicationsIcon className="-mt-10px mr-1 inline-block" />{" "}
        {t("switchToApiMode.title")}{" "}
      </h2>
      <p className="mb-4">{t("switchToApiMode.description")}</p>
      <ApiKeyButton
        theme="secondary"
        i18nKey="switchToApiMode.btnText"
        showDelete={true}
        showHelp={false}
      />
    </div>
  );
};

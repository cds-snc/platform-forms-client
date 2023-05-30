import React, { ReactElement, useState } from "react";
import axios from "axios";
import { Setting } from "@prisma/client";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { checkPrivileges } from "@lib/privileges";
import AdminNavLayout from "@components/globals/layouts/AdminNavLayout";
import { ToastContainer, toast } from "@components/form-builder/app/shared/Toast";
import { getAllAppSettings } from "@lib/appSettings";
import { Button } from "@components/globals";
import { useAccessControl, useRefresh } from "@lib/hooks";
import { logMessage } from "@lib/logger";

const ManageSetting = ({
  setting,
  clearSelection,
  canManageSettings,
}: {
  setting: Setting;
  clearSelection: () => Promise<void>;
  canManageSettings: boolean;
}) => {
  const [_setting, _setSetting] = useState(setting);
  const { t } = useTranslation("admin-settings");
  const newSetting = !setting.internalId;

  const saveSetting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const result = await axios({
        method: newSetting ? "POST" : "PUT",
        url: newSetting ? "/api/settings" : `/api/settings/${setting.internalId}`,
        data: _setting,
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });
      logMessage.debug(result);
      if (result.data === null) {
        toast.error("Duplicate Internal Id");
        return;
      }

      toast.success(t("success"));
      clearSelection();
    } catch (error) {
      logMessage.error(error);
      toast.error(t("error"));
    }
  };

  return (
    <div className="gc-form">
      <form onSubmit={saveSetting} method="POST">
        <label htmlFor="internalId" className="gc-label">
          {t("label.internalId")}
        </label>
        <input
          className="gc-input-text mb-1"
          onChange={(e) => _setSetting((oldVal) => ({ ...oldVal, internalId: e.target.value }))}
          value={_setting.internalId}
          type="text"
          name="internalId"
          disabled={!canManageSettings}
        />
        <label htmlFor="nameEn" className="gc-label">
          {t("label.nameEn")}
        </label>
        <input
          className="gc-input-text mb-1"
          onChange={(e) => _setSetting((oldVal) => ({ ...oldVal, nameEn: e.target.value }))}
          value={_setting.nameEn}
          type="text"
          name="nameEn"
          id="nameEn"
          disabled={!canManageSettings}
        />
        <label htmlFor="nameFr" className="gc-label">
          {t("label.nameFr")}
        </label>
        <input
          className="gc-input-text mb-1"
          onChange={(e) => _setSetting((oldVal) => ({ ...oldVal, nameFr: e.target.value }))}
          value={_setting.nameFr}
          type="text"
          name="nameFr"
          id="nameFr"
          disabled={!canManageSettings}
        />
        <label htmlFor="descriptionEn" className="gc-label">
          {t("label.descriptionEn")}
        </label>
        <input
          className="gc-input-text mb-1"
          onChange={(e) => _setSetting((oldVal) => ({ ...oldVal, descriptionEn: e.target.value }))}
          value={_setting.descriptionEn ?? ""}
          type="text"
          name="descriptionEn"
          id="descriptionEn"
          disabled={!canManageSettings}
        />
        <label htmlFor="descriptionFr" className="gc-label">
          {t("label.descriptionFr")}
        </label>
        <input
          className="gc-input-text mb-1"
          onChange={(e) => _setSetting((oldVal) => ({ ...oldVal, descriptionFr: e.target.value }))}
          value={_setting.descriptionFr ?? ""}
          type="text"
          name="descriptionFr"
          id="descriptionFr"
          disabled={!canManageSettings}
        />
        <label htmlFor="value" className="gc-label">
          {t("label.value")}
        </label>
        <input
          className="gc-input-text mb-1"
          onChange={(e) => _setSetting((oldVal) => ({ ...oldVal, value: e.target.value }))}
          value={_setting.value ?? ""}
          type="text"
          name="internalId"
          id="internalId"
          disabled={!canManageSettings}
        />
        {canManageSettings ? (
          <div className="mt-4">
            <Button className="mr-2" theme="primary" type="submit">
              {t("save")}
            </Button>
            <Button type="button" theme="secondary" onClick={() => clearSelection()}>
              {t("cancel")}
            </Button>
          </div>
        ) : (
          <div className="mt-4">
            <Button type="button" theme="secondary" onClick={() => clearSelection()}>
              {t("back")}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

interface SettingsProps {
  settings: Setting[];
}
const Settings = ({ settings }: SettingsProps) => {
  const { t, i18n } = useTranslation("admin-settings");
  const [selectedSetting, setSelectedSetting] = useState<Setting | undefined>(undefined);
  const [manageSetting, setManageSetting] = useState(false);
  const { ability } = useAccessControl();
  const { refreshData } = useRefresh(settings);
  const canManageSettings = ability?.can("update", "Setting") ?? false;
  const clearSelection = async () => {
    setSelectedSetting(undefined);
    setManageSetting(false);
    await refreshData();
  };

  const deleteSetting = async (internalId: string) => {
    try {
      await axios({
        url: `/api/settings/${internalId}`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });
      toast.success(t("deleted"));
      refreshData();
    } catch (error) {
      logMessage.error(error);
      toast.error(t("error"));
    }
  };

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <h1 className="border-0 mb-10">{t("title")}</h1>
      {!manageSetting ? (
        <div>
          <ul className="list-none pl-0">
            {settings.map((setting) => (
              <li
                key={setting.internalId}
                className="border-2 hover:border-blue-hover rounded-md p-2 m-2 flex flex-row"
              >
                <div className="grow basis-2/3 m-auto">
                  <p>{i18n.language === "fr" ? setting.nameFr : setting.nameEn}</p>
                  <p className="italic">
                    {i18n.language === "fr" ? setting.descriptionFr : setting.descriptionEn}
                  </p>
                </div>
                <div>
                  <Button
                    type="button"
                    theme="secondary"
                    className="text-sm whitespace-nowrap mr-2"
                    onClick={() => {
                      setSelectedSetting(setting);
                      setManageSetting(true);
                    }}
                  >
                    {canManageSettings ? t("manageSetting") : t("viewSetting")}
                  </Button>
                  {canManageSettings && (
                    <Button
                      type="button"
                      theme="destructive"
                      className="text-sm whitespace-nowrap"
                      onClick={() => deleteSetting(setting.internalId)}
                    >
                      {t("deleteSetting")}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {canManageSettings && (
            <div className="pt-6">
              <Button
                type="button"
                theme="primary"
                className="w-auto rounded-md"
                onClick={() => setManageSetting(true)}
              >
                {t("createSetting")}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <ManageSetting
          setting={
            selectedSetting ?? {
              internalId: "",
              nameEn: "",
              nameFr: "",
              descriptionEn: null,
              descriptionFr: null,
              value: null,
            }
          }
          clearSelection={clearSelection}
          canManageSettings={canManageSettings}
        />
      )}

      <div className="sticky top-0">
        <ToastContainer />
      </div>
    </>
  );
};

Settings.getLayout = (page: ReactElement) => {
  return <AdminNavLayout user={page.props.user}>{page}</AdminNavLayout>;
};

export const getServerSideProps = requireAuthentication(async ({ locale, user: { ability } }) => {
  checkPrivileges(ability, [{ action: "view", subject: "Setting" }]);
  const settings = await getAllAppSettings(ability);
  return {
    props: {
      ...(locale &&
        (await serverSideTranslations(locale, ["common", "admin-settings", "admin-login"]))),
      settings,
    },
  };
});

export default Settings;

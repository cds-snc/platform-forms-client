"use client";
import React, { useState } from "react";
import { Setting } from "@prisma/client";
import { useTranslation } from "@i18n/client";

import { ToastContainer, toast } from "@clientComponents/form-builder/app/shared/Toast";

import { Button } from "@clientComponents/globals";
import { useAccessControl } from "@lib/hooks";
import { logMessage } from "@lib/logger";
import { createSetting, deleteSetting, updateSetting } from "./actions";

const ManageSetting = ({
  setting,
  clearSelection,
  canManageSettings,
}: {
  setting: Setting;
  clearSelection: () => Promise<void>;
  canManageSettings: boolean;
}) => {
  const { t } = useTranslation("admin-settings");
  const isNewSetting = !setting.internalId;

  const saveSettingServer = async (formData: FormData) => {
    const setting = {
      internalId: formData.get("internalId") as string,
      nameEn: formData.get("nameEn") as string,
      nameFr: formData.get("nameFr") as string,
      descriptionEn: formData.get("descriptionEn") as string,
      descriptionFr: formData.get("descriptionFr") as string,
      value: formData.get("value") as string,
    };

    // TODO form validation?

    try {
      if (isNewSetting) {
        await createSetting(setting.internalId, setting);
      } else {
        await updateSetting(setting.internalId, setting);
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
      <form action={saveSettingServer}>
        <label htmlFor="internalId" className="gc-label mt-2 mb-0">
          {t("label.internalId")}
        </label>
        <input
          className="gc-input-text mb-1"
          defaultValue={setting.internalId}
          type="text"
          name="internalId"
          disabled={!canManageSettings}
        />
        <label htmlFor="nameEn" className="gc-label mt-2 mb-0">
          {t("label.nameEn")}
        </label>
        <input
          className="gc-input-text mb-1"
          defaultValue={setting.nameEn}
          type="text"
          name="nameEn"
          id="nameEn"
          disabled={!canManageSettings}
        />
        <label htmlFor="nameFr" className="gc-label mt-2 mb-0">
          {t("label.nameFr")}
        </label>
        <input
          className="gc-input-text mb-1"
          defaultValue={setting.nameFr}
          type="text"
          name="nameFr"
          id="nameFr"
          disabled={!canManageSettings}
        />
        <label htmlFor="descriptionEn" className="gc-label mt-2 mb-0">
          {t("label.descriptionEn")}
        </label>
        <input
          className="gc-input-text mb-1"
          defaultValue={setting.descriptionEn ?? ""}
          type="text"
          name="descriptionEn"
          id="descriptionEn"
          disabled={!canManageSettings}
        />
        <label htmlFor="descriptionFr" className="gc-label mt-2 mb-0">
          {t("label.descriptionFr")}
        </label>
        <input
          className="gc-input-text mb-1"
          defaultValue={setting.descriptionFr ?? ""}
          type="text"
          name="descriptionFr"
          id="descriptionFr"
          disabled={!canManageSettings}
        />
        <label htmlFor="value" className="gc-label mt-2 mb-0">
          {t("label.value")}
        </label>
        <input
          className="gc-input-text mb-1"
          defaultValue={setting.value ?? ""}
          type="text"
          name="value"
          id="value"
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
export const Settings = ({ settings }: SettingsProps) => {
  const { t, i18n } = useTranslation("admin-settings");
  const [selectedSetting, setSelectedSetting] = useState<Setting | undefined>(undefined);
  const [manageSetting, setManageSetting] = useState(false);
  const { ability } = useAccessControl();
  const canManageSettings = ability?.can("update", "Setting") ?? false;

  const clearSelection = async () => {
    setSelectedSetting(undefined);
    setManageSetting(false);
  };

  // TODO error handling

  const deleteSettingAction = async (internalId: string) => {
    try {
      await deleteSetting(internalId);
      toast.success(t("deleted"));
    } catch (error) {
      logMessage.error(error);
      toast.error(t("error"));
    }
  };

  return (
    <>
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
                      onClick={() => deleteSettingAction(setting.internalId)}
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
        <ToastContainer containerId="default" />
      </div>
    </>
  );
};

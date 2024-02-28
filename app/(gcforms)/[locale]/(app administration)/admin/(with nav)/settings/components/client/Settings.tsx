"use client";
import React, { useState } from "react";
import { Setting } from "@prisma/client";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { useAccessControl } from "@lib/hooks";
import { ManageSetting } from "./ManageSetting";
import { DeleteSettingsButton } from "./DeleteSettingsButton";

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
                  {canManageSettings && <DeleteSettingsButton id={setting.internalId} />}
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
    </>
  );
};

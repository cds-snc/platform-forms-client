import React from "react";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { DeleteSettingsButton } from "../client/DeleteSettingsButton";
import { authorization } from "@lib/privileges";
import { getAllAppSettings } from "@lib/appSettings";
import { serverTranslation } from "@i18n";

export const Settings = async () => {
  const {
    t,
    i18n: { language },
  } = await serverTranslation("admin-settings");

  const editAvailable = await authorization
    .canManageSettings()
    .then(() => true)
    .catch(() => false);

  const settings = await getAllAppSettings();

  return (
    <div>
      <ul className="list-none pl-0">
        {settings.map((setting) => (
          <li
            key={setting.internalId}
            className="m-2 flex flex-row rounded-md border-2 p-2 hover:border-blue-hover"
          >
            <div className="m-auto grow basis-2/3">
              <p>{language === "fr" ? setting.nameFr : setting.nameEn}</p>
              <p className="italic">
                {language === "fr" ? setting.descriptionFr : setting.descriptionEn}
              </p>
            </div>
            <div>
              <LinkButton.Secondary
                href={`/${language}/admin/settings/${setting.internalId}`}
                className="mr-2"
              >
                {editAvailable ? t("manageSetting") : t("viewSetting")}
              </LinkButton.Secondary>
              {editAvailable && <DeleteSettingsButton id={setting.internalId} />}
            </div>
          </li>
        ))}
      </ul>
      {editAvailable && (
        <div className="pt-6">
          <LinkButton.Primary href={`/${language}/admin/settings/create`}>
            {t("createSetting")}
          </LinkButton.Primary>
        </div>
      )}
    </div>
  );
};

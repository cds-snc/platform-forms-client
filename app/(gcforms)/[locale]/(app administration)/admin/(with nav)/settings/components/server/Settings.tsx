import React from "react";
import { PrimaryLinkButton, SecondaryLinkButton } from "@clientComponents/globals";
import { DeleteSettingsButton } from "../client/DeleteSettingsButton";
import { requireAuthentication } from "@lib/auth";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { getAllAppSettings } from "@lib/appSettings";
import { serverTranslation } from "@i18n";

export const Settings = async () => {
  const { user } = await requireAuthentication();
  checkPrivilegesAsBoolean(user.ability, [{ action: "update", subject: "Setting" }], {
    redirect: true,
  });
  // Note: could add a util to return an array if this is useful elsewhere
  const canUpdateSettings = user.ability?.can("update", "Setting") ?? false;
  const canCreateSettings = user.ability?.can("create", "Setting") ?? false;
  const canDeleteSettings = user.ability?.can("delete", "Setting") ?? false;

  const settings = await getAllAppSettings(user.ability);

  const {
    t,
    i18n: { language },
  } = await serverTranslation("admin-settings");

  return (
    <div>
      <ul className="list-none pl-0">
        {settings.map((setting) => (
          <li
            key={setting.internalId}
            className="border-2 hover:border-blue-hover rounded-md p-2 m-2 flex flex-row"
          >
            <div className="grow basis-2/3 m-auto">
              <p>{language === "fr" ? setting.nameFr : setting.nameEn}</p>
              <p className="italic">
                {language === "fr" ? setting.descriptionFr : setting.descriptionEn}
              </p>
            </div>
            <div>
              <SecondaryLinkButton
                href={`/${language}/admin/settings/${setting.internalId}`}
                className="mr-2"
              >
                {canUpdateSettings ? t("manageSetting") : t("viewSetting")}
              </SecondaryLinkButton>
              {canDeleteSettings && <DeleteSettingsButton id={setting.internalId} />}
            </div>
          </li>
        ))}
      </ul>
      {canCreateSettings && (
        <div className="pt-6">
          <PrimaryLinkButton href={`/${language}/admin/settings/create`}>
            {t("createSetting")}
          </PrimaryLinkButton>
        </div>
      )}
    </div>
  );
};

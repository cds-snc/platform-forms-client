import React from "react";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { DeleteSettingsButton } from "../client/DeleteSettingsButton";
import { auth } from "@lib/auth";
import { getAllAppSettings } from "@lib/appSettings";
import { serverTranslation } from "@i18n";
import { redirect } from "next/navigation";
import { createAbility } from "@lib/privileges";

export const Settings = async () => {
  const {
    t,
    i18n: { language },
  } = await serverTranslation("admin-settings");

  const session = await auth();
  if (!session) redirect(`/${language}/auth/login`);
  const ability = createAbility(session);

  // Note: could add a util to return an array if this is useful elsewhere
  const canUpdateSettings = ability?.can("update", "Setting") ?? false;
  const canCreateSettings = ability?.can("create", "Setting") ?? false;
  const canDeleteSettings = ability?.can("delete", "Setting") ?? false;

  const settings = await getAllAppSettings(ability);

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
              <LinkButton.Secondary
                href={`/${language}/admin/settings/${setting.internalId}`}
                className="mr-2"
              >
                {canUpdateSettings ? t("manageSetting") : t("viewSetting")}
              </LinkButton.Secondary>
              {canDeleteSettings && <DeleteSettingsButton id={setting.internalId} />}
            </div>
          </li>
        ))}
      </ul>
      {canCreateSettings && (
        <div className="pt-6">
          <LinkButton.Primary href={`/${language}/admin/settings/create`}>
            {t("createSetting")}
          </LinkButton.Primary>
        </div>
      )}
    </div>
  );
};

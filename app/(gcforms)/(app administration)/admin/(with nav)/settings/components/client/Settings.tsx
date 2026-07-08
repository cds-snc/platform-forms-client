"use client";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { DeleteSettingsButton } from "./DeleteSettingsButton";
import { useAccessControl } from "@root/lib/hooks/useAccessControl";
import { useTranslation } from "@i18n/client";

type Setting = {
  internalId: string;
  descriptionEn: string | null;
  descriptionFr: string | null;
  nameEn: string;
  nameFr: string;
  value: string | null;
};

export const Settings = ({ settings }: { settings: Setting[] }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("admin-settings");

  const { ability } = useAccessControl();

  const editAvailable = ability?.can("update", "Setting") ?? false;

  return (
    <div>
      <ul className="list-none pl-0">
        {settings.map((setting) => (
          <li
            key={setting.internalId}
            className="hover:border-blue-hover m-2 flex flex-row rounded-md border-2 p-2"
          >
            <div className="m-auto grow basis-2/3">
              <p>{language === "fr" ? setting.nameFr : setting.nameEn}</p>
              <p className="italic">
                {language === "fr" ? setting.descriptionFr : setting.descriptionEn}
              </p>
            </div>
            <div>
              <LinkButton.Secondary href={`/admin/settings/${setting.internalId}`} className="mr-2">
                {editAvailable ? t("manageSetting") : t("viewSetting")}
              </LinkButton.Secondary>
              {editAvailable && <DeleteSettingsButton id={setting.internalId} />}
            </div>
          </li>
        ))}
      </ul>
      {editAvailable && (
        <div className="pt-6">
          <LinkButton.Primary href={`/admin/settings/create`}>
            {t("createSetting")}
          </LinkButton.Primary>
        </div>
      )}
    </div>
  );
};

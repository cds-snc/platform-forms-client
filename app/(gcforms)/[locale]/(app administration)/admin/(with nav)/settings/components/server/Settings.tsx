import React from "react";
import { authorization } from "@lib/privileges";
import { getAllAppSettings } from "@lib/appSettings";
import { serverTranslation } from "@i18n";
import { SettingValueEditor } from "../client/SettingValueEditor";

export const Settings = async () => {
  const {
    t,
    i18n: { language },
  } = await serverTranslation("admin-settings");

  const editAvailable = await authorization
    .canManageSettings()
    .then(() => true)
    .catch(() => false);

  const settings = await getAllAppSettings(language);
  const groupedSettings = settings.reduce((groups, setting) => {
    const key = setting.groupEn ?? setting.groupFr ?? "ungrouped";
    const group = groups.get(key) ?? {
      label: language === "fr" ? setting.groupFr : setting.groupEn,
      settings: [],
    };
    group.settings.push(setting);
    groups.set(key, group);
    return groups;
  }, new Map<string, { label: string | null; settings: (typeof settings)[number][] }>());

  return (
    <div className="space-y-8">
      {[...groupedSettings.entries()].map(([key, group]) => (
        <section key={key} aria-labelledby={`setting-group-${key.replaceAll(/\s+/g, "-")}`}>
          <h2
            id={`setting-group-${key.replaceAll(/\s+/g, "-")}`}
            className="mt-0 mb-3 text-2xl font-bold"
          >
            {group.label ?? t("other")}
          </h2>
          <ul className="m-0 list-none p-0 pl-2">
            {group.settings.map((setting) => {
              const name = language === "fr" ? setting.nameFr : setting.nameEn;
              const description = language === "fr" ? setting.descriptionFr : setting.descriptionEn;
              const currentValue =
                setting.type === "boolean"
                  ? setting.value === "true" || setting.value?.toUpperCase() === "ON"
                    ? t("on")
                    : t("off")
                  : (setting.value ?? t("unset"));

              return (
                <li
                  key={setting.internalId}
                  className="mb-4 flex max-w-2xl flex-row rounded-md border-2 border-black p-2"
                >
                  <div className="m-auto grow basis-2/3">
                    <p className="font-bold">{name}</p>
                    {description && <p className="italic">{description}</p>}
                    <p className="mt-2 text-sm">
                      <span className="font-semibold">{t("label.value")}:</span>{" "}
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 font-medium">
                        {currentValue}
                      </span>
                    </p>
                  </div>
                  {editAvailable && (
                    <div className="ml-3 shrink-0">
                      <SettingValueEditor
                        internalId={setting.internalId}
                        name={name}
                        description={description}
                        type={setting.type as "string" | "boolean" | "number"}
                        value={setting.value}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
};

import { serverTranslation } from "@i18n";
import { createSetting, getSetting, updateSetting } from "../../actions";
import { SecondaryLinkButton } from "@clientComponents/globals";
import { SaveButton } from "../client/SaveButton";
import { redirect } from "next/navigation";
import { Danger } from "@clientComponents/globals/Alert/Alert";

export const ManageSettingForm = async ({
  settingId,
  canManageSettings,
}: {
  settingId?: string;
  canManageSettings: boolean;
}) => {
  const {
    t,
    i18n: { language },
  } = await serverTranslation("admin-settings");

  const isCreateSetting = settingId ? false : true;

  let setting;
  if (settingId) {
    setting = await getSetting(settingId);
  } else {
    setting = {
      internalId: "",
      nameEn: "",
      nameFr: "",
      descriptionEn: null,
      descriptionFr: null,
      value: null,
    };
  }

  const formActionWrapper = async (formData: FormData) => {
    "use server";
    if (isCreateSetting) {
      await createSetting(formData).catch(() => {
        redirect(`/${language}/admin/settings?success=errorCreating`);
      });
      redirect(`/${language}/admin/settings?success=created`);
    } else {
      await updateSetting(formData).catch(() => {
        redirect(`/${language}/admin/settings?success=errorUpdating`);
      });
      redirect(`/${language}/admin/settings?success=updated`);
    }
  };

  return (
    <div className="gc-form">
      {setting ? (
        <form action={formActionWrapper}>
          <label htmlFor="internalId" className="gc-label mt-2 mb-0">
            {t("label.internalId")}
          </label>
          <input
            className="gc-input-text mb-1"
            defaultValue={setting?.internalId}
            type="text"
            name="internalId"
            readOnly={!canManageSettings}
            {...(canManageSettings && { required: true })}
          />
          <label htmlFor="nameEn" className="gc-label mt-2 mb-0">
            {t("label.nameEn")}
          </label>
          <input
            className="gc-input-text mb-1"
            defaultValue={setting?.nameEn}
            type="text"
            name="nameEn"
            id="nameEn"
            readOnly={!canManageSettings}
            {...(canManageSettings && { required: true })}
          />
          <label htmlFor="nameFr" className="gc-label mt-2 mb-0">
            {t("label.nameFr")}
          </label>
          <input
            className="gc-input-text mb-1"
            defaultValue={setting?.nameFr}
            type="text"
            name="nameFr"
            id="nameFr"
            readOnly={!canManageSettings}
            {...(canManageSettings && { required: true })}
          />
          <label htmlFor="descriptionEn" className="gc-label mt-2 mb-0">
            {t("label.descriptionEn")}
          </label>
          <input
            className="gc-input-text mb-1"
            defaultValue={setting?.descriptionEn ?? ""}
            type="text"
            name="descriptionEn"
            id="descriptionEn"
            readOnly={!canManageSettings}
          />
          <label htmlFor="descriptionFr" className="gc-label mt-2 mb-0">
            {t("label.descriptionFr")}
          </label>
          <input
            className="gc-input-text mb-1"
            defaultValue={setting?.descriptionFr ?? ""}
            type="text"
            name="descriptionFr"
            id="descriptionFr"
            readOnly={!canManageSettings}
          />
          <label htmlFor="value" className="gc-label mt-2 mb-0">
            {t("label.value")}
          </label>
          <input
            className="gc-input-text mb-1"
            defaultValue={setting?.value ?? ""}
            type="text"
            name="value"
            id="value"
            readOnly={!canManageSettings}
            {...(canManageSettings && { required: true })}
          />
          <div className="mt-4">
            <SaveButton />
            <SecondaryLinkButton href={`/${language}/admin/settings`}>
              {canManageSettings ? t("cancel") : t("back")}
            </SecondaryLinkButton>
          </div>
        </form>
      ) : (
        <>
          <Danger title={t("settingNotFound")} focussable={true} />
          <SecondaryLinkButton href={`/${language}/admin/settings`} className="mt-8">
            {t("back")}
          </SecondaryLinkButton>
        </>
      )}
    </div>
  );
};

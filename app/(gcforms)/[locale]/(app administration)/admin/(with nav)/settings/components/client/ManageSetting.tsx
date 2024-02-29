"use client";
import { Setting } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { createSetting, updateSetting } from "../../actions";
import { logMessage } from "@lib/logger";
import { Button } from "@clientComponents/globals";
import { ManageSettingButton } from "./ManageSettingButton";
import { toast } from "@formBuilder/components/shared";

export const ManageSetting = ({
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

  const saveSetting = async (formData: FormData) => {
    try {
      const setting = {
        internalId: formData.get("internalId") as string,
        nameEn: formData.get("nameEn") as string,
        nameFr: formData.get("nameFr") as string,
        descriptionEn: formData.get("descriptionEn") as string,
        descriptionFr: formData.get("descriptionFr") as string,
        value: formData.get("value") as string,
      };

      if (isNewSetting) {
        await createSetting(setting.internalId, setting);
      } else {
        await updateSetting(setting.internalId, setting);
      }

      toast.success(t("success"));
      clearSelection();
    } catch (e) {
      logMessage.error(e);
      toast.error(t("error"));
      throw e;
    }
  };

  return (
    <div className="gc-form">
      <form action={saveSetting}>
        <label htmlFor="internalId" className="gc-label mt-2 mb-0">
          {t("label.internalId")}
        </label>
        <input
          className="gc-input-text mb-1"
          defaultValue={setting.internalId}
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
          defaultValue={setting.nameEn}
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
          defaultValue={setting.nameFr}
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
          defaultValue={setting.descriptionEn ?? ""}
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
          defaultValue={setting.descriptionFr ?? ""}
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
          defaultValue={setting.value ?? ""}
          type="text"
          name="value"
          id="value"
          readOnly={!canManageSettings}
          {...(canManageSettings && { required: true })}
        />
        {canManageSettings ? (
          <div className="mt-4">
            <Button className="mr-2" theme="primary" type="submit">
              {t("save")}
            </Button>
            <ManageSettingButton clearSelection={clearSelection}>{t("cancel")}</ManageSettingButton>
          </div>
        ) : (
          <div className="mt-4">
            <ManageSettingButton clearSelection={clearSelection}>{t("back")}</ManageSettingButton>
          </div>
        )}
      </form>
    </div>
  );
};

import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { SaveButton } from "../client/SaveButton";
import { Danger } from "@clientComponents/globals/Alert/Alert";
import { Label } from "@clientComponents/forms";
import { getFullAppSetting, createAppSetting, updateAppSetting } from "@lib/appSettings";
import { redirect } from "next/navigation";
import { I18n } from "@root/i18n";

export const ManageSettingForm = async ({ settingId }: { settingId?: string }) => {
  const isCreateSetting = settingId ? false : true;

  let setting;
  if (settingId) {
    // An access control error will redirect the user to the login page
    // Other errors will hit the nearest error boundary
    setting = await getFullAppSetting(settingId);
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
    // use server is needed to expose the function to the form component
    if (isCreateSetting) {
      await createSetting(formData)
        .then(redirect(`/admin/settings?success=created`))
        .catch(redirect(`/admin/settings?error=errorCreating`));
    } else {
      await updateSetting(formData)
        .then(redirect(`/admin/settings?success=updated`))
        .catch(redirect(`/admin/settings?error=errorUpdating`));
    }
  };

  return (
    <>
      <div className="gc-form">
        {setting ? (
          <form action={formActionWrapper}>
            <Label htmlFor="internalId" required={true}>
              <I18n i18nKey="label.internalId" namespace="admin-settings" />
            </Label>
            <input
              className="gc-input-text mb-1"
              defaultValue={setting?.internalId}
              type="text"
              name="internalId"
              required={true}
            />
            <Label htmlFor="nameEn" required={true} className="mt-6">
              <I18n i18nKey="label.nameEn" namespace="admin-settings" />
            </Label>
            <input
              className="gc-input-text mb-1"
              defaultValue={setting?.nameEn}
              type="text"
              name="nameEn"
              id="nameEn"
              required={true}
            />
            <Label htmlFor="nameFr" required={true} className="mt-6">
              <I18n i18nKey="label.nameFr" namespace="admin-settings" />
            </Label>
            <input
              className="gc-input-text mb-1"
              defaultValue={setting?.nameFr}
              type="text"
              name="nameFr"
              id="nameFr"
              required={true}
            />
            <Label htmlFor="descriptionEn" className="mt-6">
              <I18n i18nKey="label.descriptionEn" namespace="admin-settings" />
            </Label>
            <input
              className="gc-input-text mb-1"
              defaultValue={setting?.descriptionEn ?? ""}
              type="text"
              name="descriptionEn"
              id="descriptionEn"
            />
            <Label htmlFor="descriptionFr" className="mt-6">
              <I18n i18nKey="label.descriptionFr" namespace="admin-settings" />
            </Label>
            <input
              className="gc-input-text mb-1"
              defaultValue={setting?.descriptionFr ?? ""}
              type="text"
              name="descriptionFr"
              id="descriptionFr"
            />
            <Label htmlFor="value" required={true} className="mt-6">
              <I18n i18nKey="label.value" namespace="admin-settings" />
            </Label>
            <input
              className="gc-input-text mb-1"
              defaultValue={setting?.value ?? ""}
              type="text"
              name="value"
              id="value"
              required={true}
            />
            <div className="mt-8">
              <SaveButton />
              <LinkButton.Secondary href={`/admin/settings`}>
                <I18n i18nKey="cancel" namespace="admin-settings" />
              </LinkButton.Secondary>
            </div>
          </form>
        ) : (
          <>
            <Danger i18nKey="settingNotFound" namespace="admin-settings" focussable={true} />
            <LinkButton.Secondary href={`/admin/settings`} className="mt-8">
              <I18n i18nKey="back" namespace="admin-settings" />
            </LinkButton.Secondary>
          </>
        )}
      </div>
    </>
  );
};

async function createSetting(formData: FormData) {
  const setting = {
    internalId: nullCheck(formData, "internalId"),
    nameEn: nullCheck(formData, "nameEn"),
    nameFr: nullCheck(formData, "nameFr"),
    descriptionEn: formData.get("descriptionEn") as string,
    descriptionFr: formData.get("descriptionFr") as string,
    value: nullCheck(formData, "value"),
  };

  await createAppSetting(
    setting as {
      internalId: string;
      nameEn: string;
      nameFr: string;
    }
  );
}

async function updateSetting(formData: FormData) {
  const setting = {
    internalId: nullCheck(formData, "internalId"),
    nameEn: nullCheck(formData, "nameEn"),
    nameFr: nullCheck(formData, "nameFr"),
    descriptionEn: formData.get("descriptionEn") as string,
    descriptionFr: formData.get("descriptionFr") as string,
    value: nullCheck(formData, "value"),
  };

  await updateAppSetting(setting.internalId, setting);
}

function nullCheck(formData: FormData, key: string) {
  const result = formData.get(key);
  if (!result) throw new Error(`No value found for ${key}`);
  return result as string;
}

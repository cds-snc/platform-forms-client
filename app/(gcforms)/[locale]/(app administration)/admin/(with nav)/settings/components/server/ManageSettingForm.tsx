import { serverTranslation } from "@i18n";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { SaveButton } from "../client/SaveButton";
import { Danger } from "@clientComponents/globals/Alert/Alert";
import { Label } from "@clientComponents/forms";
import { getFullAppSetting, createAppSetting, updateAppSetting } from "@lib/appSettings";
import { redirect } from "next/navigation";

export const ManageSettingForm = async ({ settingId }: { settingId?: string }) => {
  const {
    t,
    i18n: { language },
  } = await serverTranslation("admin-settings");

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
        .then(redirect(`/${language}/admin/settings?success=created`))
        .catch(redirect(`/${language}/admin/settings?error=errorCreating`));
    } else {
      await updateSetting(formData)
        .then(redirect(`/${language}/admin/settings?success=updated`))
        .catch(redirect(`/${language}/admin/settings?error=errorUpdating`));
    }
  };

  return (
    <>
      <div className="gc-form">
        {setting ? (
          <form action={formActionWrapper}>
            <Label htmlFor="internalId" required={true}>
              {t("label.internalId")}
            </Label>
            <input
              className="gc-input-text mb-1"
              defaultValue={setting?.internalId}
              type="text"
              name="internalId"
              required={true}
            />
            <Label htmlFor="nameEn" required={true} className="mt-6">
              {t("label.nameEn")}
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
              {t("label.nameFr")}
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
              {t("label.descriptionEn")}
            </Label>
            <input
              className="gc-input-text mb-1"
              defaultValue={setting?.descriptionEn ?? ""}
              type="text"
              name="descriptionEn"
              id="descriptionEn"
            />
            <Label htmlFor="descriptionFr" className="mt-6">
              {t("label.descriptionFr")}
            </Label>
            <input
              className="gc-input-text mb-1"
              defaultValue={setting?.descriptionFr ?? ""}
              type="text"
              name="descriptionFr"
              id="descriptionFr"
            />
            <Label htmlFor="value" required={true} className="mt-6">
              {t("label.value")}
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
              <LinkButton.Secondary href={`/${language}/admin/settings`}>
                {t("cancel")}
              </LinkButton.Secondary>
            </div>
          </form>
        ) : (
          <>
            <Danger title={t("settingNotFound")} focussable={true} />
            <LinkButton.Secondary href={`/${language}/admin/settings`} className="mt-8">
              {t("back")}
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

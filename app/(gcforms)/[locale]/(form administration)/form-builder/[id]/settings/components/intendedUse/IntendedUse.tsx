import Markdown from "markdown-to-jsx";
import { useTranslation } from "@i18n/client";

import { Radio } from "@formBuilder/components/shared/MultipleChoice";

import { FormPurposeHelpButton } from "../dialogs/FormPurposeHelpButton";

/*
 * PurposeOption is used to determine the purpose of the form
 * admin: The form is used to collect personal information
 * nonAdmin: The form is used to collect non-personal information
 */
export enum PurposeOption {
  none = "",
  admin = "admin",
  nonAdmin = "nonAdmin",
}

export const IntendedUse = ({
  isPublished,
  onChange,
  purposeOption,
}: {
  isPublished: boolean;
  purposeOption: PurposeOption;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const { t } = useTranslation("form-builder");

  return (
    <div className="mb-10">
      <h2>{t("settingsPurposeAndUse.title")}</h2>
      <p className="mb-6 text-sm">{t("settingsPurposeAndUse.description")}</p>
      <Radio
        id="purposeAndUseAdmin"
        name="purpose-use"
        label={t("settingsPurposeAndUse.personalInfo")}
        labelClassName="font-bold"
        disabled={isPublished}
        checked={purposeOption === PurposeOption.admin}
        value={PurposeOption.admin}
        onChange={onChange}
      />
      <div className="mb-4 ml-12 text-sm">
        <div>
          <Markdown options={{ forceBlock: false }}>
            {t("settingsPurposeAndUse.personalInfoDetails")}
          </Markdown>
        </div>
        <ul>
          <li>{t("settingsPurposeAndUse.personalInfoDetailsVals.1")}</li>
          <li>{t("settingsPurposeAndUse.personalInfoDetailsVals.2")}</li>
          <li>{t("settingsPurposeAndUse.personalInfoDetailsVals.3")}</li>
        </ul>
      </div>
      <Radio
        id="purposeAndUseNonAdmin"
        name="purpose-use"
        label={t("settingsPurposeAndUse.nonAdminInfo")}
        labelClassName="font-bold"
        disabled={isPublished}
        checked={purposeOption === PurposeOption.nonAdmin}
        value={PurposeOption.nonAdmin}
        onChange={onChange}
      />
      <div className="mb-4 ml-12 text-sm">
        <div>
          <Markdown options={{ forceBlock: false }}>
            {t("settingsPurposeAndUse.nonAdminInfoDetails")}
          </Markdown>
        </div>
        <ul>
          <li>{t("settingsPurposeAndUse.nonAdminInfoDetailsVals.1")}</li>
          <li>{t("settingsPurposeAndUse.nonAdminInfoDetailsVals.2")}</li>
          <li>{t("settingsPurposeAndUse.nonAdminInfoDetailsVals.3")}</li>
        </ul>
      </div>

      <FormPurposeHelpButton />
    </div>
  );
};

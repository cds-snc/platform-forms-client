import React from "react";
import { useTranslation } from "next-i18next";
import useTemplateStore from "../store/useTemplateStore";
import useNavigationStore from "../store/useNavigationStore";
import { Button } from "../shared/Button";

const Label = ({ htmlFor, children }: { htmlFor: string; children?: JSX.Element | string }) => {
  return (
    <label className="block font-bold mb-1" htmlFor={htmlFor}>
      {children}
    </label>
  );
};

const HintText = ({ id, children }: { id: string; children?: JSX.Element | string }) => {
  return (
    <span className="block text-sm mb-1" id={id}>
      {children}
    </span>
  );
};

const TextInput = ({
  id,
  describedBy,
  value,
  onChange,
}: {
  id: string;
  describedBy?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <input
      id={id}
      aria-describedby={describedBy}
      type="text"
      className="w-3/5 py-2 px-3 my-2 rounded border-2 border-black-default border-solid focus:outline-2 focus:outline-blue-focus focus:outline focus:border-blue-focus"
      value={value}
      onChange={onChange}
    />
  );
};

export const Settings = () => {
  const { t } = useTranslation("form-builder");
  const {
    initialize,
    submission: { email },
    updateField,
  } = useTemplateStore();
  const { setTab } = useNavigationStore();

  return (
    <>
      <form>
        <div className="mb-10">
          <Label htmlFor="response-delivery">{t("settingsReponseTitle")}</Label>
          <HintText id="response-delivery-hint-1">{t("settingsReponseHint1")}</HintText>
          <HintText id="response-delivery-hint-2">{t("settingsReponseHint2")}</HintText>
          <TextInput
            id="response-delivery"
            describedBy="response-delivery-hint-1 response-delivery-hint-2"
            value={email}
            onChange={(e) => {
              updateField(`submission.email`, e.target.value);
            }}
          />
        </div>

        <div className="mb-10">
          <Label htmlFor="format">{t("settingsFormatTitle")}</Label>
          <HintText id="format-hint">{t("settingsFormatHint")}</HintText>
          <select
            id="format"
            className="w-1/2 py-2 px-3 my-2 rounded border-2 border-black-default border-solid focus:outline-2 focus:outline-blue-focus focus:outline focus:border-blue-focus"
          >
            <option value="pdf">{t("settingsFormatOption1")}</option>
            <option value="paper">{t("settingsFormatOption2")}</option>
            <option value="work">{t("settingsFormatOption3")}</option>
            <option value="other">{t("settingsFormatOption4")}</option>
          </select>
        </div>

        <div className="mb-10">
          <Label htmlFor="delete">{t("settingsDeleteTitle")}</Label>
          <HintText id="delete-hint">{t("settingsDeleteHint")}</HintText>
          <div className="mt-4">
            <Button
              id="delete-form"
              theme="destructive"
              onClick={() => {
                initialize(); // Reset the form
                setTab("start"); // Back to start page
              }}
            >
              {t("settingsDeleteButton")}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
};

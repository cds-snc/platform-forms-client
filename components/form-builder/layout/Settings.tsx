import React from "react";
import { useTranslation } from "next-i18next";
import { useTemplateStore } from "../store/useTemplateStore";
import { useNavigationStore } from "../store/useNavigationStore";

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

export const Button = ({
  children,
  onClick,
  className,
  id,
  disabled = false,
  "aria-label": ariaLabel = undefined,
  theme = "primary",
}: {
  children?: JSX.Element | string;
  id?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
  theme?: "primary" | "secondary" | "destructive";
}) => {
  const themes = {
    primary:
      "bg-blue-dark text-white-default border-black-default hover:text-white-default hover:bg-blue-light active:text-white-default active:bg-blue-active",
    secondary:
      "bg-white-default text-black-default border-black-default hover:text-white-default hover:bg-gray-600 active:text-white-default active:bg-gray-500",
    destructive:
      "bg-red-default text-white-default border-red-default hover:bg-red-destructive hover:border-red-destructive active:bg-red-hover focus:border-blue-hover",
  };

  return (
    <button
      onClick={onClick}
      className={`${className} ${themes[theme]} relative py-2 px-5 rounded-lg border-2  border-solid active:top-0.5 focus:outline-2 focus:outline-blue-focus focus:outline focus:outline-offset-2 focus:bg-blue-focus focus:text-white-default`}
      id={id}
      disabled={disabled}
      aria-label={ariaLabel}
      type="button"
    >
      {children}
    </button>
  );
};

export const Settings = () => {
  const { t } = useTranslation("form-builder");
  const { initialize, email, updateField } = useTemplateStore((s) => ({
    initialize: s.initialize,
    email: s.submission.email,
    updateField: s.updateField,
  }));
  const setTab = useNavigationStore((s) => s.setTab);

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

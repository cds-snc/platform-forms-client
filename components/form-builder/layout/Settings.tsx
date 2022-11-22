import React from "react";
import { useTranslation } from "next-i18next";
import { useTemplateStore } from "../store/useTemplateStore";
import { useNavigationStore } from "../store/useNavigationStore";
import { Button } from "../shared/Button";
import { Input } from "../shared/Input";
import { useSession } from "next-auth/react";

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

export const Settings = () => {
  const { t } = useTranslation("form-builder");
  const { initialize, email, updateField } = useTemplateStore((s) => ({
    initialize: s.initialize,
    email: s.submission.email,
    updateField: s.updateField,
  }));
  const setTab = useNavigationStore((s) => s.setTab);
  const { status } = useSession();

  return (
    <>
      <h1 className="visually-hidden">{t("formSettings")}</h1>
      <div className="mb-10">
        <Label htmlFor="response-delivery">{t("settingsReponseTitle")}</Label>
        <HintText id="response-delivery-hint-1">{t("settingsReponseHint1")}</HintText>
        <HintText id="response-delivery-hint-2">{t("settingsReponseHint2")}</HintText>
        <Input
          id="response-delivery"
          describedBy="response-delivery-hint-1 response-delivery-hint-2"
          value={email ?? ""}
          className="w-3/5"
          onChange={(e) => {
            updateField(`submission.email`, e.target.value);
          }}
        />
      </div>

      {status === "authenticated" && (
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
      )}
    </>
  );
};

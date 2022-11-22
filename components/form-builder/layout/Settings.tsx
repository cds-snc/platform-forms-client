import React from "react";
import { useTranslation } from "next-i18next";
import { useTemplateStore } from "../store/useTemplateStore";
import { Button } from "../shared/Button";
import { Input } from "../shared/Input";
import { useSession } from "next-auth/react";
import { useDeleteForm } from "../hooks/useDelete";
import { WarningIcon, CheckIcon } from "../icons";
import Markdown from "markdown-to-jsx";

const SuccessMessage = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div className="mt-10 p-5 bg-yellow-100 flex">
      <div className="flex">
        <div className="pr-7 pt-2">
          <CheckIcon />
        </div>
      </div>
      <div>
        <h3 className="mb-1">{t("formDeletedTitle")}</h3>
        <Markdown options={{ forceBlock: true }}>{t("formDeleted")}</Markdown>
      </div>
    </div>
  );
};

const ErrorMessage = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div className="mt-10 p-5 bg-red-100 flex">
      <div className="flex">
        <div className="pr-7 pt-2">
          <WarningIcon />
        </div>
      </div>
      <div>
        <h3 className="mb-1">{t("formDeleteTitleFailed")}</h3>
        <Markdown options={{ forceBlock: true }}>{t("formDeleteFailed")}</Markdown>
      </div>
    </div>
  );
};

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
  const { handleDelete } = useDeleteForm();
  const [formDeleted, setFormDeleted] = React.useState(false);
  const [error, setError] = React.useState(false);
  const { id, initialize, email, updateField } = useTemplateStore((s) => ({
    id: s.id,
    initialize: s.initialize,
    email: s.submission.email,
    updateField: s.updateField,
  }));
  const { status } = useSession();

  return (
    <>
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

      {status === "authenticated" && id && (
        <div className="mb-10">
          <Label htmlFor="delete">{t("settingsDeleteTitle")}</Label>
          <HintText id="delete-hint">{t("settingsDeleteHint")}</HintText>
          <div className="mt-4">
            <Button
              id="delete-form"
              theme="destructive"
              onClick={async () => {
                const result = await handleDelete(id);
                if (result && "error" in result) {
                  setError(true);
                  return;
                }
                setFormDeleted(true);
                initialize(); // Reset the form
              }}
            >
              {t("settingsDeleteButton")}
            </Button>
          </div>
        </div>
      )}
      {formDeleted && <SuccessMessage />}
      {error && <ErrorMessage />}
    </>
  );
};

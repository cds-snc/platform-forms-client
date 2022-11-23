import React from "react";
import { useTranslation } from "next-i18next";
import { useTemplateStore } from "../store/useTemplateStore";
import { Button } from "../shared/Button";
import { Input } from "../shared/Input";
import { useSession } from "next-auth/react";
import { useDeleteForm } from "../hooks/useDelete";
import Markdown from "markdown-to-jsx";
import { useDialogRef, Dialog } from "../shared/Dialog";
import { useNavigationStore } from "../store/useNavigationStore";

const FormDeleted = () => {
  const { t } = useTranslation("form-builder");
  const { setTab } = useNavigationStore((s) => ({
    setTab: s.setTab,
  }));
  const dialog = useDialogRef();
  const actions = (
    <Button
      onClick={() => {
        dialog.current?.close();
        setTab("start");
      }}
    >
      {t("formDeletedDialogOkay")}
    </Button>
  );

  return (
    <Dialog title={t("formDeletedDialogTitle")} dialogRef={dialog} actions={actions}>
      <Markdown options={{ forceBlock: true }}>{t("formDeletedDialogMessage")}</Markdown>
    </Dialog>
  );
};

const FormDeletedError = ({ handleClose }: { handleClose: () => void }) => {
  const { t } = useTranslation("form-builder");
  const dialog = useDialogRef();
  const actions = (
    <Button
      onClick={() => {
        dialog.current?.close();
        handleClose();
      }}
    >
      {t("formDeletedDialogOkayFailed")}
    </Button>
  );

  return (
    <Dialog title={t("formDeleteDialogTitleFailed")} dialogRef={dialog} actions={actions}>
      <Markdown options={{ forceBlock: true }}>{t("formDeletedDialogMessageFailed")}</Markdown>
    </Dialog>
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
      {formDeleted && <FormDeleted />}
      {error && (
        <FormDeletedError
          handleClose={() => {
            setError(false);
          }}
        />
      )}
    </>
  );
};

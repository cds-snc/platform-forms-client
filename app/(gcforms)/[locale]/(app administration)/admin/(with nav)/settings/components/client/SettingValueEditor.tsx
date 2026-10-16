"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { saveSettingValue } from "../../actions";
import type { AppSettingType } from "@lib/appSettings";

type SettingValueEditorProps = {
  internalId: string;
  name: string;
  description: string | null;
  type: AppSettingType;
  value: string | null;
};

export const SettingValueEditor = ({
  internalId,
  name,
  description,
  type,
  value,
}: SettingValueEditorProps) => {
  const { t } = useTranslation("admin-settings");
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const openDialog = () => {
    setDraft(value ?? "");
    setError(false);
    dialogRef.current?.showModal();
  };

  const closeDialog = () => dialogRef.current?.close();
  const booleanValue = draft === "true" || draft.toUpperCase() === "ON";

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(false);
    try {
      await saveSettingValue(internalId, draft);
      closeDialog();
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button type="button" theme="secondary" onClick={openDialog}>
        {t("manageSetting")}
      </Button>
      <dialog
        ref={dialogRef}
        aria-labelledby={`${internalId}-dialog-title`}
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
        className="fixed inset-0 m-auto w-[min(32rem,calc(100%-2rem))] rounded-md border-0 p-6 shadow-xl backdrop:bg-gray-900/50"
      >
        <form onSubmit={save}>
          <h2 id={`${internalId}-dialog-title`} className="mb-2 text-2xl font-bold">
            {name}
          </h2>
          {description && (
            <p id={`${internalId}-description`} className="mb-6">
              {description}
            </p>
          )}

          {type === "boolean" ? (
            <div className="flex items-center gap-3">
              <button
                id={`${internalId}-value`}
                type="button"
                role="switch"
                aria-checked={booleanValue}
                aria-label={name}
                aria-describedby={description ? `${internalId}-description` : undefined}
                disabled={saving}
                onClick={() => setDraft(booleanValue ? "false" : "true")}
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-wait ${
                  booleanValue ? "bg-blue-700" : "bg-gray-400"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                    booleanValue ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span>{booleanValue ? t("on") : t("off")}</span>
            </div>
          ) : (
            <>
              <label className="mb-2 block font-bold" htmlFor={`${internalId}-value`}>
                {t("label.value")}
              </label>
              <input
                id={`${internalId}-value`}
                className="gc-input-text mb-1"
                type={type === "number" ? "number" : "text"}
                step={type === "number" ? "any" : undefined}
                required={type === "number"}
                value={draft}
                onChange={(event) => setDraft(event.currentTarget.value)}
              />
            </>
          )}

          {error && (
            <p role="alert" className="mt-4 text-red-700">
              {t("error.save")}
            </p>
          )}
          <div className="mt-8 flex gap-3">
            <Button type="submit" theme="primary" disabled={saving}>
              {saving ? t("saving") : t("save")}
            </Button>
            <Button type="button" theme="secondary" onClick={closeDialog} disabled={saving}>
              {t("cancel")}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
};

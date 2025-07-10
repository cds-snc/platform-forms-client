"use client";

import { useTransition, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@i18n/client";

import { FormAlias } from "@prisma/client";

import { Button, Alert } from "@clientComponents/globals";
import { createAlias, deleteAlias, updateAlias } from "./actions";
import { type Language } from "@lib/types/form-builder-types";
import { slugify } from "@lib/client/clientHelpers";

type Template = {
  id: string;
  name: string;
};

function DeleteButton({
  id,
  setServerError,
}: {
  id: string;
  setServerError: (msg: string | null) => void;
}) {
  const { t } = useTranslation("my-forms");
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      theme="destructive"
      onClick={() =>
        startTransition(async () => {
          setServerError(null);
          const result = await deleteAlias(id);
          if (result.error) {
            setServerError(result.error);
          }
        })
      }
      disabled={isPending}
    >
      {isPending ? t("aliases.deleting") : t("aliases.delete")}
    </Button>
  );
}

export const AliasForm = ({
  locale,
  HOST,
  aliases,
  templates,
}: {
  locale: Language;
  HOST: string;
  aliases: FormAlias[];
  templates: Template[];
}) => {
  const [isPending, startTransition] = useTransition();
  const [editingAlias, setEditingAlias] = useState<FormAlias | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [aliasValue, setAliasValue] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const { t } = useTranslation("my-forms");

  useEffect(() => {
    if (editingAlias && formRef.current) {
      (formRef.current.elements.namedItem("alias") as HTMLInputElement).value = editingAlias.alias;
      setAliasValue(editingAlias.alias);
      (formRef.current.elements.namedItem("formId") as HTMLSelectElement).value =
        editingAlias.formId;
    } else {
      formRef.current?.reset();
      setAliasValue("");
    }
    setServerError(null);
  }, [editingAlias]);

  const formAction = async (formData: FormData) => {
    setServerError(null);
    if (editingAlias) {
      const result = await updateAlias(editingAlias.id, formData);
      if (result.error) {
        setServerError(result.error);
        return;
      }
      setEditingAlias(null);
    } else {
      const result = await createAlias(formData);
      if (result.error) {
        setServerError(t(result.error));
        return;
      }
    }
    formRef.current?.reset();
    setAliasValue("");
  };

  const handleAliasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAliasValue(slugify(e.target.value));
  };

  return (
    <div>
      {serverError && (
        <div className="mb-4">
          <Alert.Danger>
            <Alert.Title headingTag="h3">{t("aliases.error.title")}</Alert.Title>
            <Alert.Body>
              <p>{t(`aliases.error.${serverError}`)}</p>
            </Alert.Body>
          </Alert.Danger>
        </div>
      )}
      <h2 className="mb-4 text-xl">
        {editingAlias ? t("aliases.editAlias") : t("aliases.createAlias")}
      </h2>
      <form
        ref={formRef}
        action={(formData) => {
          startTransition(() => formAction(formData));
        }}
        className="flex items-end gap-4"
      >
        <div className="gcds-input-wrapper w-1/3">
          <label htmlFor="alias" className="mb-2 block">
            {t("aliases.alias")}
          </label>
          <input
            type="text"
            name="alias"
            id="alias"
            className="required w-11/12 rounded border-1.5 border-solid border-slate-500 px-3 py-2 focus:border-blue-focus focus:outline focus:outline-2 focus:outline-blue-focus"
            value={aliasValue}
            onChange={handleAliasChange}
            required
          />
        </div>
        <div>
          <label htmlFor="formId" className="mb-2 block">
            {t("aliases.form")}
          </label>
          <div className="gcds-select-wrapper">
            <select
              name="formId"
              id="formId"
              required
              defaultValue=""
              className="gc-dropdown !mb-0 inline-block"
            >
              <option value="" disabled>
                {t("aliases.selectForm")}
              </option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="mb-6" theme="primary" type="submit" disabled={isPending}>
            {isPending
              ? editingAlias
                ? t("aliases.updating")
                : t("aliases.creating")
              : editingAlias
              ? t("aliases.update")
              : t("aliases.create")}
          </Button>
          {editingAlias && (
            <Button
              className="mb-6"
              theme="secondary"
              type="button"
              onClick={() => setEditingAlias(null)}
            >
              {t("aliases.cancel")}
            </Button>
          )}
        </div>
      </form>

      <div>
        {aliasValue ? (
          <p className="-mt-10px mb-5 text-sm text-slate-500">
            {t("aliases.URL")}: {`${HOST}/id/`}
            <strong>{aliasValue}</strong>
          </p>
        ) : (
          <p className="-mt-10px mb-5 text-sm text-slate-500">{"\u00A0"}</p>
        )}
      </div>

      <h2 className="mb-4 text-xl">{t("aliases.existingAliases")}</h2>
      <table className="w-full table-fixed text-left">
        <thead>
          <tr>
            <th className="w-1/4 border p-2">{t("aliases.alias")}</th>
            <th className="w-1/2 border p-2">{t("aliases.form")}</th>
            <th className="w-1/4 border p-2">{t("aliases.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {aliases.map((alias) => (
            <tr key={alias.id}>
              <td className="border p-2">
                <Link href={`${HOST}/id/${alias.alias}`}>{alias.alias}</Link>
              </td>
              <td className="border p-2">
                <Link href={`/${locale}/form-builder/${alias.formId}/settings`}>
                  {templates.find((t) => t.id === alias.formId)?.name ?? alias.formId}
                </Link>
              </td>
              <td className="border p-2">
                <div className="flex gap-2">
                  <Button theme="secondary" onClick={() => setEditingAlias(alias)}>
                    {t("aliases.edit")}
                  </Button>
                  <DeleteButton id={alias.id} setServerError={setServerError} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

"use client";

import { useTransition, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@i18n/client";

import { FormAlias } from "@prisma/client";

import { Button } from "@clientComponents/globals";
import { createAlias, deleteAlias, updateAlias } from "./actions";
import { type Language } from "@lib/types/form-builder-types";

type Template = {
  id: string;
  name: string;
};

function DeleteButton({ id }: { id: string }) {
  const { t } = useTranslation("my-forms");
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      theme="destructive"
      onClick={() =>
        startTransition(async () => {
          await deleteAlias(id);
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

  const { t } = useTranslation("my-forms");

  useEffect(() => {
    if (editingAlias && formRef.current) {
      (formRef.current.elements.namedItem("alias") as HTMLInputElement).value = editingAlias.alias;
      (formRef.current.elements.namedItem("formId") as HTMLSelectElement).value =
        editingAlias.formId;
    } else {
      formRef.current?.reset();
    }
  }, [editingAlias]);

  const formAction = async (formData: FormData) => {
    if (editingAlias) {
      await updateAlias(editingAlias.id, formData);
      setEditingAlias(null);
    } else {
      await createAlias(formData);
    }
    formRef.current?.reset();
  };

  return (
    <div>
      <h2 className="mb-4 text-xl">
        {editingAlias ? t("aliases.editAlias") : t("aliases.createAlias")}
      </h2>
      <form
        ref={formRef}
        action={(formData) => {
          startTransition(() => formAction(formData));
        }}
        className="mb-8 flex items-end gap-4"
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

      <h2 className="mb-4 text-xl">{t("aliases.existingAliases")}</h2>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="border p-2">{t("aliases.alias")}</th>
            <th className="border p-2">{t("aliases.form")}</th>
            <th className="border p-2">{t("aliases.actions")}</th>
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
                  <DeleteButton id={alias.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

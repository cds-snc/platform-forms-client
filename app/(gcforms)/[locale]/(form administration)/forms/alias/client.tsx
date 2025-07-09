"use client";

import { useTransition, useState, useRef, useEffect } from "react";
import { createAlias, deleteAlias, updateAlias } from "./actions";
import { FormAlias } from "@prisma/client";

import { Button } from "@clientComponents/globals";

type Template = {
  id: string;
};

function DeleteButton({ id }: { id: string }) {
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
      {isPending ? "Deleting..." : "Delete"}
    </Button>
  );
}

export const AliasForm = ({
  HOST,
  aliases,
  templates,
}: {
  HOST: string;
  aliases: FormAlias[];
  templates: Template[];
}) => {
  const [isPending, startTransition] = useTransition();
  const [editingAlias, setEditingAlias] = useState<FormAlias | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
      <h2 className="mb-4 text-xl">{editingAlias ? "Edit Alias" : "Create Alias"}</h2>
      <form
        ref={formRef}
        action={(formData) => {
          startTransition(() => formAction(formData));
        }}
        className="mb-8 flex items-end gap-4"
      >
        <div>
          <label htmlFor="alias" className="mb-2 block">
            Alias
          </label>
          <input type="text" name="alias" id="alias" className="border p-2" required />
        </div>
        <div>
          <label htmlFor="formId" className="mb-2 block">
            Form
          </label>
          <select name="formId" id="formId" className="border p-2" required defaultValue="">
            <option value="" disabled>
              Select a form
            </option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.id}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button theme="primary" type="submit" disabled={isPending}>
            {isPending
              ? editingAlias
                ? "Updating..."
                : "Creating..."
              : editingAlias
              ? "Update Alias"
              : "Create Alias"}
          </Button>
          {editingAlias && (
            <Button theme="secondary" type="button" onClick={() => setEditingAlias(null)}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <h2 className="mb-4 text-xl">Existing Aliases</h2>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="border p-2">Alias</th>
            <th className="border p-2">Form ID</th>
            <th className="border p-2">Created At</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {aliases.map((alias) => (
            <tr key={alias.id}>
              <td className="border p-2">
                <a href={`${HOST}/${alias.alias}`} target="_blank" rel="noopener noreferrer">
                  {alias.alias}
                </a>
              </td>
              <td className="border p-2">
                {templates.find((t) => t.id === alias.formId)?.id ?? alias.formId}
              </td>
              <td className="border p-2">{alias.createdAt.toLocaleDateString()}</td>
              <td className="border p-2">
                <div className="flex gap-2">
                  <Button theme="secondary" onClick={() => setEditingAlias(alias)}>
                    Edit
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

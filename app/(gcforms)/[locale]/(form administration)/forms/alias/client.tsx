"use client";

import { useTransition } from "react";
import { createAlias, deleteAlias } from "./actions";
import { FormAlias } from "@prisma/client";

type Template = {
  id: string;
};

function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      onClick={() =>
        startTransition(async () => {
          await deleteAlias(id);
        })
      }
      disabled={isPending}
      className="bg-red-600 p-2 text-white"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
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

  // en/id/cmcw2z2yj0001nb754br54eh1

  return (
    <div>
      <form
        action={(formData) => {
          startTransition(async () => {
            await createAlias(formData);
          });
        }}
        className="mb-8 flex gap-4"
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
          <select name="formId" id="formId" className="border p-2" required>
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
        <div className="self-end">
          <button type="submit" disabled={isPending} className="bg-blue-600 p-2 text-white">
            {isPending ? "Creating..." : "Create Alias"}
          </button>
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
                <a href={`${HOST}/id/${alias.alias}`} target="_blank" rel="noopener noreferrer">
                  {alias.alias}
                </a>
              </td>
              <td className="border p-2">{alias.formId}</td>
              <td className="border p-2">{alias.createdAt.toLocaleDateString()}</td>
              <td className="border p-2">
                <DeleteButton id={alias.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

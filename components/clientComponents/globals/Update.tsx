"use client";

import Markdown from "markdown-to-jsx";
import { Button } from "./Buttons";
import { useAppUpdate } from "@lib/hooks/useAppUpdate";

export const Update = () => {
  const { updateRequired } = useAppUpdate();

  // short circuit when no update needed
  if (!updateRequired) return null;

  return (
    <div
      id="modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="m-4 w-full max-w-lg rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{"GCForms needs to update"}</h2>
        </div>

        <Markdown options={{ forceBlock: true }}>
          {"To continue use GCForms you must update to the lastest version."}
        </Markdown>
        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => {
              window.location.reload();
            }}
            type="submit"
            theme="primary"
          >
            {"Update"}
          </Button>
        </div>
      </div>
    </div>
  );
};

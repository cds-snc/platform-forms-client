"use client";

import Markdown from "markdown-to-jsx";
import { Button } from "./Buttons";
import { useAppUpdate } from "@lib/hooks/useAppUpdate";
import { useTranslation } from "@i18n/client";
import { useEffect, useState } from "react";

export const AppUpdater = () => {
  const { updateRequired } = useAppUpdate();

  // short circuit when no update needed
  if (!updateRequired) return null;

  return <UpdateModal />;
};

const regex = /^\/?(en|fr)\/id\/[a-z0-9]+$/;

export const UpdateModal = () => {
  const { t } = useTranslation("common");

  const [isPublicFacing, setIsPublicFacing] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setIsPublicFacing(regex.test(window.location.pathname));
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const heading = isPublicFacing ? t("appUpdate.user.title") : t("appUpdate.builder.title");
  const message = isPublicFacing
    ? t("appUpdate.user.description")
    : t("appUpdate.builder.description");
  const buttonText = isPublicFacing ? t("appUpdate.user.button") : t("appUpdate.builder.button");

  if (isPublicFacing === undefined) return null;

  return (
    <div
      id="modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="m-4 w-full max-w-lg rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{heading}</h2>
        </div>

        <Markdown options={{ forceBlock: true }}>{message}</Markdown>
        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => {
              window.location.reload();
            }}
            type="submit"
            theme="primary"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

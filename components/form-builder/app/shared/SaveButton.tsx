import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";

import { Button } from "../shared";
import { useTemplateStore } from "../../store";
import { useAllowPublish, useTemplateStatus, useTemplateApi } from "../../hooks";
import { formatDateTime } from "../../util";
import Markdown from "markdown-to-jsx";

export const SaveButton = () => {
  const { id, setId } = useTemplateStore((s) => ({
    id: s.id,
    setId: s.setId,
  }));

  const { error, saveForm } = useTemplateApi();

  const { status } = useSession();
  const { t } = useTranslation(["common", "form-builder"]);
  const { isReady, asPath } = useRouter();
  const [isStartPage, setIsStartPage] = useState(false);
  const { isSaveable } = useAllowPublish();
  const { updatedAt, getTemplateById } = useTemplateStatus();

  const handleSave = async () => {
    const result = await saveForm();

    if (result) {
      setId(result);
      getTemplateById();
    }
  };

  useEffect(() => {
    if (isReady) {
      const activePathname = new URL(asPath, location.href).pathname;
      if (activePathname === "/form-builder") {
        setIsStartPage(true);
      } else {
        setIsStartPage(false);
      }
    }
  }, [asPath, isReady]);

  const dateTime = (updatedAt && formatDateTime(new Date(updatedAt).getTime())) || [];

  return !isStartPage && isSaveable() && status === "authenticated" ? (
    <div
      data-id={id}
      className={`mt-12 p-4 -ml-4 w-40 laptop:w-52 text-sm laptop:text-base ${
        id && (error ? "bg-red-100" : "bg-yellow-100")
      }`}
    >
      <Button onClick={handleSave}>{t("saveDraft", { ns: "form-builder" })}</Button>
      {error && (
        <div className="text-red-500 pt-4 text-sm">
          <Markdown options={{ forceBlock: true }}>{error}</Markdown>
        </div>
      )}
      <div className="mt-4" aria-live="polite">
        {dateTime.length == 2 && (
          <>
            <div className="font-bold">{t("lastSaved", { ns: "form-builder" })}</div>
            <div className="text-sm">
              {dateTime[0]} {t("at")} {dateTime[1]}{" "}
            </div>
          </>
        )}
      </div>
    </div>
  ) : null;
};

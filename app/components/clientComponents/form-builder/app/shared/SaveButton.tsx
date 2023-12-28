import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "@i18n/client";
import { useSession } from "next-auth/react";

import { Button } from "@clientComponents/globals";
import { useTemplateStore } from "../../store";
import { useTemplateStatus, useTemplateContext } from "../../hooks";
import { formatDateTime } from "../../util";
import Markdown from "markdown-to-jsx";

export const SaveButton = () => {
  const { id } = useTemplateStore((s) => ({
    id: s.id,
  }));

  const { error, saveForm } = useTemplateContext();

  const { status } = useSession();
  const { t, i18n } = useTranslation(["common", "form-builder"]);
  const { isReady, asPath } = useRouter();
  const [isStartPage, setIsStartPage] = useState(false);
  const { updatedAt, getTemplateById } = useTemplateStatus();

  const handleSave = async () => {
    const saved = await saveForm();

    if (saved) {
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

  const dateTime =
    (updatedAt && formatDateTime(new Date(updatedAt).getTime(), `${i18n.language}-CA`)) || [];

  return !isStartPage && status === "authenticated" ? (
    <div
      data-id={id}
      className={`-ml-4 mt-12 w-40 p-4 text-sm laptop:w-52 laptop:text-base ${
        id && (error ? "bg-red-100" : "bg-yellow-100")
      }`}
    >
      <Button onClick={handleSave}>{t("saveDraft", { ns: "form-builder" })}</Button>
      {error && (
        <div className="pt-4 text-sm text-red-500">
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

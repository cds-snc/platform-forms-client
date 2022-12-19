import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";

import { Button } from "../shared";
import { useTemplateStore } from "../../store";
import { usePublish, useAllowPublish, useTemplateStatus } from "../../hooks";
import { formatDateTime } from "../../util";

export const SaveButton = () => {
  const { getSchema, id, setId } = useTemplateStore((s) => ({
    id: s.id,
    setId: s.setId,
    getSchema: s.getSchema,
  }));

  const { status } = useSession();
  const { t } = useTranslation(["common", "form-builder"]);
  const { isReady, asPath } = useRouter();
  const [isStartPage, setIsStartPage] = useState(false);
  const { uploadJson } = usePublish();
  const { isSaveable } = useAllowPublish();
  const { updatedAt, getTemplateById } = useTemplateStatus();

  const handlePublish = async () => {
    const schema = JSON.parse(getSchema());
    delete schema.id;
    delete schema.isPublished;

    const result = await uploadJson(JSON.stringify(schema), id);

    if (result?.id) {
      setId(result?.id);
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
    <div data-id={id} className="mt-12 p-4 -ml-4 bg-yellow-100">
      <Button onClick={handlePublish}>{t("saveDraft", { ns: "form-builder" })}</Button>
      {dateTime.length == 2 && (
        <div className="mt-4 " role="alert" aria-live="polite">
          <div className="font-bold">{t("lastSaved", { ns: "form-builder" })}</div>
          <div className="text-sm">
            {dateTime[0]} {t("at")} {dateTime[1]}{" "}
          </div>
        </div>
      )}
    </div>
  ) : null;
};

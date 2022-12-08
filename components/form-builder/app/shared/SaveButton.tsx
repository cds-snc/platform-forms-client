import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";
import axios from "axios";
import { FormRecord } from "@lib/types";

import { useTemplateStore } from "../../store";
import { usePublish, useAllowPublish } from "../../hooks";
import { Button } from "../shared";
import { formatDateTime } from "../../util";

export const SaveButton = () => {
  const { getSchema, id, setId } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    getSchema: s.getSchema,
    id: s.id,
    setId: s.setId,
    email: s.submission?.email,
  }));

  const { status } = useSession();
  const { t } = useTranslation(["common", "form-builder"]);
  const { isReady, asPath } = useRouter();
  const [isStartPage, setIsStartPage] = useState(false);
  const { uploadJson } = usePublish();
  const { isSaveable } = useAllowPublish();
  const [updatedAt, setUpdatedAt] = useState<number | undefined>();
  // note: savedAt is used to trigger a refetch of the template data from the server
  const [savedAt, setSavedAt] = useState<number | undefined>();

  useEffect(() => {
    const fetchTemplate = async () => {
      const templates = await axios({
        url: "/api/templates",
        method: "GET",
        headers: { "Content-Type": "application/json" },
        data: { formID: id },
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });

      setUpdatedAt(
        templates?.data.find((template: FormRecord) => template.id === id || "")?.updatedAt || ""
      );
    };
    status === "authenticated" && fetchTemplate();
  }, [id, savedAt]);

  const handlePublish = async () => {
    const schema = JSON.parse(getSchema());
    delete schema.id;
    delete schema.isPublished;

    const result = await uploadJson(JSON.stringify(schema), id);

    if (result?.id) {
      setId(result?.id);
      setSavedAt(new Date().getTime());
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
    <div className="mt-12 p-4 -ml-4 bg-yellow-100">
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

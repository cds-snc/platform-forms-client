"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslation } from "@i18n/client";
import Skeleton from "react-loading-skeleton";
import { clearTemplateStore } from "@lib/store/useTemplateStore";

export const ResumeEditingForm = () => {
  const [hasSession, setHasSession] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const { t, i18n } = useTranslation("my-forms");

  const formIdRef = useRef();

  useEffect(() => {
    if (typeof sessionStorage === "undefined") {
      setLoading(false);
      return;
    }

    try {
      // check if there is a valid form session
      const data = sessionStorage.getItem("form-storage");
      const parsedData = data && JSON.parse(data);
      const {
        state: {
          id,
          form: { titleEn, titleFr },
        },
      } = parsedData;

      formIdRef.current = id;

      if (titleEn !== "" || titleFr !== "") {
        setHasSession(true);
        setLoading(false);
        return;
      }

      // clean up empty sessions
      throw new Error("Invalid form session");
    } catch (e) {
      // noop
      clearTemplateStore();
      setLoading(false);
    }
  }, []);

  return hasSession ? (
    <Link
      href={`/${i18n.language}/form-builder/${formIdRef.current}/edit`}
      className="mb-4 inline-block"
    >
      <span aria-hidden="true"> ← </span> {t("actions.resumeForm")}
    </Link>
  ) : (
    loading && <Skeleton className="h-6 w-[200px]" />
  );
};

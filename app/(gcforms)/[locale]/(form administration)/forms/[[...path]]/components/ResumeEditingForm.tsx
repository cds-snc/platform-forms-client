"use client";
import React, { useEffect, useRef } from "react";

import { clearTemplateStore } from "@lib/store";
import Link from "next/link";
import { useTranslation } from "@i18n/client";

export const ResumeEditingForm = () => {
  const [hasSession, setHasSession] = React.useState(false);

  const { t, i18n } = useTranslation("my-forms");

  const formIdRef = useRef();

  useEffect(() => {
    if (typeof sessionStorage === "undefined") {
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
        return;
      }

      // clean up empty sessions
      throw new Error("Invalid form session");
    } catch (e) {
      // noop
      clearTemplateStore();
    }
  }, []);

  return hasSession ? (
    <Link
      href={`/${i18n.language}/form-builder/${formIdRef.current}/edit`}
      className="mb-4 inline-block"
    >
      <span aria-hidden="true"> ← </span> {t("actions.resumeForm")}
    </Link>
  ) : null;
};

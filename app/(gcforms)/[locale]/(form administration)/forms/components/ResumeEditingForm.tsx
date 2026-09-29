"use client";
import React, { use, useCallback, useEffect, useRef } from "react";
import { browser } from "react-dom";
import Link from "next/link";
import { useTranslation } from "@i18n/client";
import Skeleton from "react-loading-skeleton";
import { clearTemplateStore } from "@lib/store/utils";
import { safeJSONParse } from "@lib/utils";
import { FormServerErrorCodes } from "@lib/types/form-builder-types";
import { ga } from "@root/lib/client/clientHelpers";

type FormStateType = {
  state: {
    id: string;
    form: { titleEn: string; titleFr: string };
  };
};

export const ResumeEditingForm = () => {
  use(browser("ResumeEditingForm requires session storage."));
  const [hasSession, setHasSession] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [formId, setFormId] = React.useState("");

  const { t, i18n } = useTranslation("my-forms");

  const formIdRef = useRef("");

  useEffect(() => {
    try {
      // check if there is a valid form session
      const data = sessionStorage.getItem("form-storage");
      const parsedData = data && safeJSONParse<FormStateType>(data);
      if (!parsedData) {
        throw new Error(FormServerErrorCodes.JSON_PARSE);
      }

      const {
        state: {
          id,
          form: { titleEn, titleFr },
        },
      } = parsedData;

      formIdRef.current = id;
      // The form ID comes from external session storage and drives the resume link.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronize external session storage
      setFormId(id);

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

  const handleResumeClick = useCallback(() => {
    ga("resume_editing_form_click", { formId: formIdRef.current });
  }, []);

  return hasSession ? (
    <Link
      id={formId}
      href={`/${i18n.language}/form-builder/${formId}/edit`}
      className="mb-4 inline-block"
      onClick={handleResumeClick}
    >
      <span aria-hidden="true"> ← </span> {t("actions.resumeForm")}
    </Link>
  ) : (
    loading && (
      <div data-testid="resume-editing-form">
        <Skeleton className="h-6 w-[200px]" />
      </div>
    )
  );
};

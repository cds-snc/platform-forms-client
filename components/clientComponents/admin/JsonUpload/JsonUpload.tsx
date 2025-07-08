"use client";
import React, { useState } from "react";
import { useTranslation } from "@i18n/client";
import { FormRecord } from "@lib/types";
import { useRouter } from "next/navigation";
import Loader from "../../globals/Loader";
import { logMessage } from "@lib/logger";
import { useRefresh } from "@lib/hooks/useRefresh";
import { safeJSONParse } from "@lib/utils";
import { toast } from "@formBuilder/components/shared/Toast";
import { Button } from "@clientComponents/globals";
import { FormProperties } from "@lib/types";
import { createOrUpdateTemplate } from "@formBuilder/actions";

interface JSONUploadProps {
  form?: FormRecord;
}

export const JSONUpload = (props: JSONUploadProps): React.ReactElement => {
  const { t, i18n } = useTranslation(["admin-templates", "form-builder"]);
  const { form } = props;
  const { id: formID, form: formConfig } = form || { id: undefined };
  const [jsonConfig, setJsonConfig] = useState(formID ? JSON.stringify(formConfig, null, 2) : "");
  const [submitStatus, setSubmitStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorState, setErrorState] = useState({ message: "" });
  const { refreshData, isRefreshing } = useRefresh([formConfig]);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorState({ message: "" });
    setSubmitStatus("");
    // Test if the json config is valid
    const parsedJson = safeJSONParse<FormProperties>(jsonConfig);
    if (!parsedJson) {
      setSubmitting(false);
      setErrorState({ message: "JSON Formatting error" });
      toast.error(t("startErrorParse", { ns: "form-builder" }), "wide");
      return;
    }

    try {
      const response = await createOrUpdateTemplate({
        id: formID,
        formConfig: parsedJson,
        name: parsedJson.titleEn,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // If the server returned a record, and we did not have a formID this is a new record
      // Redirect to the appropriate page
      if (!formID && response.formRecord?.id) {
        router.push(`/${i18n.language}/forms`);
      } else {
        // If not, but response was successful,
        // update the page text to show a success
        setSubmitStatus(t("upload.success"));
        setSubmitting(false);
        await refreshData();
      }
    } catch (err) {
      logMessage.error(err);
      setSubmitting(false);
      const message = (err as Error).message;
      if (message.includes("JSON Validation Error: ")) {
        setErrorState({ message });
      } else {
        setErrorState({ message: "Uploading Error" });
      }
    }
  };

  return (
    <>
      <div>
        <form onSubmit={handleSubmit} method="POST" encType="multipart/form-data">
          {submitting || isRefreshing ? (
            <Loader message="Loading..." />
          ) : (
            <>
              {errorState.message && (
                <p role="alert" data-testid="alert">
                  {errorState.message}
                </p>
              )}
              <textarea
                id="jsonInput"
                rows={20}
                name="jsonInput"
                className="gc-textarea h-full font-mono"
                data-testid="jsonInput"
                defaultValue={jsonConfig}
                onChange={(e) => {
                  setJsonConfig(e.currentTarget.value);
                }}
                aria-label={t("upload.jsonConfigAriaLabel")}
              />
              <div>
                <Button type="submit" className="mt-10" data-testid="upload">
                  {t("upload.submit")}
                </Button>
                {submitStatus && (
                  <span id="submitStatus" data-testid="submitStatus">
                    {submitStatus}
                  </span>
                )}
              </div>
            </>
          )}
        </form>
      </div>
    </>
  );
};

export default JSONUpload;

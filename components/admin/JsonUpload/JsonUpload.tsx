import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from "next-i18next";
import { FormRecord } from "@lib/types";
import { useRouter } from "next/router";
import Loader from "../../globals/Loader";
import { logMessage } from "@lib/logger";
import { useRefresh } from "@lib/hooks/useRefresh";

interface JSONUploadProps {
  form?: FormRecord;
}

export const JSONUpload = (props: JSONUploadProps): React.ReactElement => {
  const { t, i18n } = useTranslation("admin-templates");
  const { form } = props;

  const [jsonConfig, setJsonConfig] = useState(form ? JSON.stringify(form.formConfig) : "");
  const [submitStatus, setSubmitStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorState, setErrorState] = useState({ message: "" });
  const { refreshData, isRefreshing } = useRefresh([form]);
  const formID = form ? form.formID : null;
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorState({ message: "" });
    setSubmitStatus("");
    // Test if the json config is valid
    try {
      JSON.parse(jsonConfig);
    } catch {
      setSubmitting(false);
      setErrorState({ message: "JSON Formatting error" });
      return;
    }

    try {
      const response = await uploadJson(formID, jsonConfig);
      // If the server returned a record, this is a new record
      // Redirect to the appropriate page

      if (response?.config.method === "post" && response?.data) {
        const formID = response.data.formID;
        router.push({
          pathname: `/${i18n.language}/id/${formID}/settings`,
          query: {
            newForm: true,
          },
        });
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
      if (axios.isAxiosError(err) && err.response) {
        if ((err.response.data.error as string).includes("JSON Validation Error: ")) {
          setErrorState({ message: err.response.data.error });
        }
      }
      setErrorState({ message: "Uploading Error" });
    }
  };

  const uploadJson = async (formID: string | null, jsonConfig: string) => {
    return await axios({
      url: "/api/templates",
      method: formID ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        formConfig: JSON.parse(jsonConfig),
        formID: formID,
      },
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
    });
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
                className="gc-textarea full-height font-mono"
                data-testid="jsonInput"
                defaultValue={form ? JSON.stringify(form.formConfig, null, 2) : ""}
                onChange={(e) => {
                  setJsonConfig(e.currentTarget.value);
                }}
                aria-label={t("upload.jsonConfigAriaLabel")}
              />
              <div>
                <button type="submit" className="gc-button" data-testid="upload">
                  {t("upload.submit")}
                </button>
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

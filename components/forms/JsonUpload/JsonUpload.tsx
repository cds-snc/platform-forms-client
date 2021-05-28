import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from "next-i18next";
import { FormDBConfigProperties } from "../../../lib/types";
import { useRouter } from "next/router";
import Loader from "../../globals/Loader";

interface JSONUploadProps {
  form?: FormDBConfigProperties;
}

export const JSONUpload = (props: JSONUploadProps): React.ReactElement => {
  const { t, i18n } = useTranslation("admin-templates");
  const { form } = props;

  const [jsonConfig, setJsonConfig] = useState(form ? JSON.stringify(form.formConfig) : "");
  const [submitStatus, setSubmitStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorState, setErrorState] = useState({ message: "" });

  const formID = form ? form.formID : null;
  const router = useRouter();

  const handleSubmit = async (jsonInput: string, formID: number | null) => {
    return await axios({
      url: "/api/templates",
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: {
        formConfig: JSON.parse(jsonInput),
        method: formID ? "UPDATE" : "INSERT",
        formID: formID,
      },
      timeout: 0,
    })
      .then((serverResponse) => {
        jsonInput = "";
        return serverResponse;
      })
      .catch((err) => {
        console.error(err);
        setSubmitting(false);
        setErrorState({ message: "Uploading Error" });
      });
  };

  return (
    <>
      <div>
        <form
          onSubmit={async (e) => {
            setSubmitting(true);
            setErrorState({ message: "" });
            e.preventDefault();
            // Test if the json config is valid
            try {
              JSON.parse(jsonConfig);
            } catch {
              setSubmitting(false);
              setErrorState({ message: "JSON Formatting error" });
            }

            const resp = await handleSubmit(jsonConfig, formID);

            // If the server returned a record, this is a new record
            // Redirect to the appropriate page

            if (resp && resp.data && resp.data.data && resp.data.data.records) {
              const formID = resp.data.data.records[0].formID;
              router.push({
                pathname: `/${i18n.language}/id/${formID}/settings`,
                query: {
                  newForm: true,
                },
              });
            } else if (resp) {
              // If not, but response was successful,
              // update the page text to show a success
              setSubmitStatus(t("upload.success"));
              setSubmitting(false);
            }
          }}
          method="POST"
          encType="multipart/form-data"
        >
          {submitting ? (
            <Loader message="Loading..." />
          ) : (
            <>
              {errorState.message ? <p role="alert">Error... Argh!!</p> : null}
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
              ></textarea>
              <div>
                <button type="submit" className="gc-button">
                  {t("upload.submit")}
                </button>
                <span id="submitStatus">{submitStatus}</span>
              </div>
            </>
          )}
        </form>
      </div>
    </>
  );
};

export default JSONUpload;

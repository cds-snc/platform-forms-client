import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from "next-i18next";
import { FormDBConfigProperties } from "../../../lib/types";
import { useRouter } from "next/router";

interface JSONUploadProps {
  form?: FormDBConfigProperties;
}

export const JSONUpload = (props: JSONUploadProps): React.ReactElement => {
  const { t, i18n } = useTranslation("admin-templates");
  const [jsonConfig, setJsonConfig] = useState("");
  const [submitStatus, setSubmitStatus] = useState("");
  const { form } = props;

  const formID = form ? form.formID : null;
  const router = useRouter();

  return (
    <>
      <div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const resp = await handleSubmit(jsonConfig, formID);
            console.log(resp);
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
            }
          }}
          method="POST"
          encType="multipart/form-data"
        >
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
        </form>
      </div>
    </>
  );
};

const handleSubmit = async (jsonInput: string, formID: number | null) => {
  const resp = await axios({
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
    });

  return resp;
};

export default JSONUpload;

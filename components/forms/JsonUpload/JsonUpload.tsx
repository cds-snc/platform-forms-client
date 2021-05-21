import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from "next-i18next";
import { FormDBConfigProperties } from "../../../lib/types";

interface JSONUploadProps {
  form?: FormDBConfigProperties;
}

const JSONUpload = (props: JSONUploadProps): React.ReactElement => {
  const { t } = useTranslation("admin-templates");
  const [jsonConfig, setJsonConfig] = useState("");
  const { form } = props;

  const formID = form ? form.formID : null;

  return (
    <>
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(jsonConfig, formID);
          }}
          method="POST"
          encType="multipart/form-data"
        >
          <textarea
            id="jsonInput"
            rows={20}
            name="jsonIput"
            className="gc-textarea full-height"
            defaultValue={form ? form.json_config : ""}
            onChange={(e) => {
              setJsonConfig(e.currentTarget.value);
            }}
          ></textarea>
          <div>
            <button type="submit" className="gc-button">
              {t("upload.submit")}
            </button>
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
      json_config: jsonInput,
      method: formID ? "UPDATE" : "INSERT",
      formID: formID,
    },
    timeout: 0,
  })
    .then((serverResponse) => {
      // TODO - indicate success
      jsonInput = "";
      console.log(serverResponse);
      return serverResponse;
    })
    .catch((err) => {
      console.error(err);
    });

  return resp;
};

export default JSONUpload;

import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "../../lib/auth";

const JSONUpload = (): React.ReactElement => {
  const { t } = useTranslation("admin-templates");
  const [jsonConfig, setJsonConfig] = useState("");

  return (
    <>
      <h1 className="gc-h1">{t("upload.title")}</h1>

      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(jsonConfig);
          }}
          method="POST"
          encType="multipart/form-data"
        >
          <textarea
            id="jsonInput"
            rows={20}
            name="jsonIput"
            className="gc-textarea full-height"
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

const handleSubmit = async (jsonInput: string) => {
  const resp = await axios({
    url: "/api/templates",
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data: {
      json_config: jsonInput,
      method: "INSERT", // todo, not hard code based on whether formID present
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

export const getServerSideProps = requireAuthentication(async (context) => {
  if (context.locale) {
    return {
      props: {
        ...(await serverSideTranslations(context.locale, ["common", "admin-templates"])),
      },
    };
  }

  return { props: {} };
});

export default JSONUpload;

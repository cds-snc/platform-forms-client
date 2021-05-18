import React from "react";
import axios from "axios";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "../../lib/auth";

const JSONUpload = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <h1 className="gc-h1">{t("upload.title")}</h1>

      <div>
        <form onSubmit={(e) => handleSubmit(e)} method="POST" encType="multipart/form-data">
          <textarea
            id="jsonInput"
            rows="20"
            name="jsonIput"
            className="gc-textarea full-height"
          ></textarea>
          <div>
            <button type="submit" className="gc-button">
              {t("upload.button")}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const jsonInput =
    e && e.target.elements && e.target.elements.jsonInput ? e.target.elements.jsonInput : {};
  if (!jsonInput || !jsonInput.value) return;
  await axios({
    url: "/api/templates",
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data: {
      json_config: jsonInput.value,
      method: "INSERT", // todo, not hard code based on whether formID present
    },
    timeout: 0,
  })
    .then((serverResponse) => {
      // TODO - indicate success
      jsonInput.value = "";
      console.log(serverResponse);
    })
    .catch((err) => {
      console.error(err);
    });
};

export const getServerSideProps = requireAuthentication(async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale, ["common"])),
    },
  };
});

export default JSONUpload;

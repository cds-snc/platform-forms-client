import React from "react";
import axios from "axios";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

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
              {t("preview.button")}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

const handleSubmit = async (e, json_config) => {
  console.log(e);
  e.preventDefault();
  await axios({
    url: "/api/templates",
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data: json_config,
    timeout: 0,
  })
    .then((serverResponse) => {
      console.log(serverResponse);
    })
    .catch((err) => {
      console.error(err);
    });
};

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

export default JSONUpload;

import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const getFormData = async (e, router) => {
  e.preventDefault();

  const formConfig =
    e && e.target.elements && e.target.elements.jsonInput ? e.target.elements.jsonInput : {};
  if (!formConfig) return;

  router.push({
    pathname: "/id/preview-form",
    query: {
      formObject: JSON.stringify(JSON.parse(formConfig.value)),
    },
  });
};

const PreviewForm = () => {
  const router = useRouter();
  const { t } = useTranslation("common");
  return (
    <>
      <h1 className="gc-h1">{t("preview.title")}</h1>

      <div>
        <form onSubmit={(e) => getFormData(e, router)} method="POST" encType="multipart/form-data">
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

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

export default PreviewForm;

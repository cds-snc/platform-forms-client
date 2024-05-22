"use client";
import * as Alert from "@clientComponents/globals/Alert/Alert";
import { useTranslation } from "@i18n/client";

export const RetrievalError = () => {
  const { t } = useTranslation("form-builder-responses");

  return (
    <Alert.Danger>
      <Alert.Title>{t("errors.retrieval.title")}</Alert.Title>
      <Alert.Body>
        <>
          {t("errors.retrieval.message")}
          <button
            onClick={
              // Attempt to recover by trying to re-render the page
              () => document.location.reload()
            }
          >
            {t("errors.retrieval.tryAgain")}
          </button>
        </>
      </Alert.Body>
    </Alert.Danger>
  );
};

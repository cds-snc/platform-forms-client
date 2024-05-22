"use client";
import { Button } from "@clientComponents/globals";
import * as Alert from "@clientComponents/globals/Alert/Alert";
import { useTranslation } from "@i18n/client";
import { FormServerErrorCodes } from "@lib/types/form-builder-types";

export const RetrievalError = () => {
  const { t } = useTranslation("form-builder-responses");

  return (
    <Alert.Danger>
      <Alert.Title>{t("errors.retrieval.title")}</Alert.Title>
      <Alert.Body>
        <>
          <p>{t("errors.retrieval.message")}</p>
          <p>
            {t("errors.errorCode")} {FormServerErrorCodes.RESPONSES_RETRIEVAL}
          </p>
          <Button
            className="mt-4"
            theme="secondary"
            onClick={
              // Attempt to recover by trying to re-render the page
              () => document.location.reload()
            }
          >
            {t("errors.retrieval.tryAgain")}
          </Button>
        </>
      </Alert.Body>
    </Alert.Danger>
  );
};

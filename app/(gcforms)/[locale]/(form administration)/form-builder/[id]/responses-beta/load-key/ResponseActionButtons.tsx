import { Button } from "@clientComponents/globals";
import { useRouter } from "next/navigation";

import { useTranslation } from "@i18n/client";
import { useResponsesContext } from "../context/ResponsesContext";

export const ResponseActionButtons = () => {
  const { t } = useTranslation(["response-api", "common"]);
  const router = useRouter();
  const { apiClient, retrieveResponses, newFormSubmissions, resetState, locale, formId } =
    useResponsesContext();

  const handleBack = () => {
    resetState();
    router.push(`/${locale}/form-builder/${formId}/responses-beta`);
  };

  const handleNext = () => {
    // clean api client state before proceeding
    router.push(`/${locale}/form-builder/${formId}/responses-beta/location`);
  };

  const handleCheck = async () => {
    void retrieveResponses();
  };

  return (
    <div className="mt-8 flex flex-row gap-4">
      <Button theme="secondary" onClick={handleBack}>
        {t("backToStart")}
      </Button>

      {apiClient && newFormSubmissions && newFormSubmissions.length === 0 ? (
        <Button theme="primary" onClick={handleCheck}>
          {t("loadKeyPage.checkForNewResponsesButton")}
        </Button>
      ) : (
        <Button
          theme="primary"
          disabled={Boolean(!apiClient || (newFormSubmissions && newFormSubmissions.length === 0))}
          onClick={handleNext}
        >
          {t("continueButton")}
        </Button>
      )}
    </div>
  );
};

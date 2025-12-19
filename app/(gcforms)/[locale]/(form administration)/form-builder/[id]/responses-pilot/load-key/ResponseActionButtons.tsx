import { Button } from "@clientComponents/globals";
import { useResponsesApp } from "../context";
import { useResponsesContext } from "../context/ResponsesContext";
import { CheckForResponsesButton } from "../components/CheckForResponsesButton";

export const ResponseActionButtons = () => {
  const { t, router } = useResponsesApp();
  const { apiClient, newFormSubmissions, resetState, locale, formId } = useResponsesContext();

  const handleBack = () => {
    resetState();
    router.push(`/${locale}/form-builder/${formId}/responses-pilot`);
  };

  const handleNext = () => {
    // clean api client state before proceeding
    router.push(`/${locale}/form-builder/${formId}/responses-pilot/location`);
  };

  return (
    <div className="mt-8 flex flex-row gap-4">
      <Button theme="secondary" onClick={handleBack} data-testid="back-to-start-button">
        {t("backToStart")}
      </Button>

      {apiClient && newFormSubmissions && newFormSubmissions.length === 0 ? (
        <CheckForResponsesButton />
      ) : (
        <Button
          theme="primary"
          disabled={Boolean(!apiClient || (newFormSubmissions && newFormSubmissions.length === 0))}
          onClick={handleNext}
          data-testid="continue-button"
        >
          {t("continueButton")}
        </Button>
      )}
    </div>
  );
};

import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";

interface SubmitButtonProps {
  disabled: boolean;
  isSubmitting?: boolean;
  submissionError?: boolean;
  buttonRef?: (element: HTMLButtonElement) => void;
}
export const SubmitButton = ({
  disabled,
  isSubmitting,
  submissionError,
  buttonRef,
}: SubmitButtonProps) => {
  const { t } = useTranslation();
  // Formik's submitting state covers validation and hCAPTCHA execution.
  const loading = Boolean(isSubmitting) && !submissionError;

  return (
    <Button
      id="form-submit-button"
      type="submit"
      disabled={disabled || isSubmitting}
      buttonRef={buttonRef}
      loading={loading}
    >
      {t("submitButton")}
    </Button>
  );
};

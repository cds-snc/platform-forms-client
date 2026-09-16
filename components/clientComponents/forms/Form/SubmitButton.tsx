import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";

interface SubmitButtonProps {
  disabled: boolean;
  isSubmitting?: boolean;
  submissionError?: boolean;
}
export const SubmitButton = ({ disabled, isSubmitting, submissionError }: SubmitButtonProps) => {
  const { t } = useTranslation();
  // Formik's submitting state covers validation and hCAPTCHA execution.
  const loading = Boolean(isSubmitting) && !submissionError;

  return (
    <Button
      id="form-submit-button"
      type="submit"
      disabled={disabled || isSubmitting}
      loading={loading}
    >
      {t("submitButton")}
    </Button>
  );
};

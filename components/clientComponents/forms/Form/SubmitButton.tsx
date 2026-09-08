import { useState } from "react";
import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";

interface SubmitButtonProps {
  disabled: boolean;
  isSubmitting?: boolean;
  submissionError?: boolean;
}
export const SubmitButton = ({ disabled, isSubmitting, submissionError }: SubmitButtonProps) => {
  const { t } = useTranslation();
  // Used to show a spinner for the initial validation and hCAPTCHA loading steps
  const [loading, setLoading] = useState(false);

  return (
    <Button
      id="form-submit-button"
      type="submit"
      disabled={disabled || isSubmitting}
      onClick={() => {
        setLoading(true);
      }}
      loading={loading && !submissionError}
    >
      {t("submitButton")}
    </Button>
  );
};

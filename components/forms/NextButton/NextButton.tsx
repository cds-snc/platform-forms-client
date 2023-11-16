import React from "react";
import { useTranslation } from "next-i18next";

import { Validate } from "@lib/types";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Button } from "@components/globals";

export const NextButton = ({
  validateForm,
  fallBack,
}: {
  validateForm: Validate["validateForm"];
  fallBack?: () => JSX.Element;
}) => {
  const { currentGroup, hasNextAction, handleNextAction } = useGCFormsContext();
  const { t } = useTranslation("form-builder");

  const handleValidation = async () => {
    let errors = {};
    validateForm && (errors = await validateForm());
    if (Object.keys(errors).length === 0) {
      return true;
    }
    return false;
  };

  if (!currentGroup || !hasNextAction(currentGroup)) {
    return fallBack ? fallBack() : <></>;
  }

  return (
    <>
      <Button
        onClick={async (e) => {
          e.preventDefault();
          if (await handleValidation()) {
            handleNextAction();
          }
        }}
      >
        {t("Next")}
      </Button>
    </>
  );
};

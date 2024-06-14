"use client";
import React from "react";
import { useTranslation } from "@i18n/client";

import { Validate } from "@lib/types";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Button } from "@clientComponents/globals";
import { LockedSections } from "@formBuilder/components/shared/right-panel/treeview/types";

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

  if (
    !currentGroup ||
    currentGroup === LockedSections.REVIEW ||
    currentGroup === LockedSections.END ||
    !hasNextAction(currentGroup)
  ) {
    return fallBack ? fallBack() : <></>;
  }

  return (
    <>
      {/* For debugging */}
      <div className="hidden">{`currentGroup=${currentGroup}`}</div>
      <Button
        onClick={async (e) => {
          e.preventDefault();
          if (await handleValidation()) {
            handleNextAction();
          }
        }}
        type="button"
      >
        {t("next")}
      </Button>
    </>
  );
};

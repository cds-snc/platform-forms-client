"use client";

import React, { type JSX } from "react";
import { useTranslation } from "@i18n/client";

import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { Validate, PublicFormRecord } from "@lib/types";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Button } from "@clientComponents/globals/Buttons/Button";
import { LockedSections } from "@formBuilder/components/shared/right-panel/treeview/types";
import { Language } from "@lib/types/form-builder-types";

import { getLocalizedProperty } from "@lib/utils";
import { showReviewPage } from "@lib/utils/form-builder/showReviewPage";
import { tryFocusOnPageLoad } from "@lib/client/clientHelpers";
import { useFormDelay } from "@lib/hooks/useFormDelayContext";
import { ForwardArrowIcon24x24 } from "@serverComponents/icons";

export const NextButton = ({
  validateForm,
  fallBack,
  language,
  formRecord,
  saveAndResumeEnabled = false,
}: {
  validateForm: Validate["validateForm"];
  fallBack?: () => JSX.Element;
  language: Language;
  formRecord: PublicFormRecord;
  saveAndResumeEnabled?: boolean;
}) => {
  const { currentGroup, hasNextAction, handleNextAction, isOffBoardSection } = useGCFormsContext();
  const { updateFormDelay } = useFormDelay();
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
    !hasNextAction(currentGroup) ||
    !showReviewPage(formRecord.form)
  ) {
    return fallBack ? fallBack() : <></>;
  }

  if (isOffBoardSection(currentGroup)) {
    const brand = formRecord.form.brand;

    const exitUrl =
      (brand?.[getLocalizedProperty("url", language)] as string | undefined) ?? t("fip.link");

    // Check for custom exit url exists for the current group
    let customExitUrl = "";

    if (formRecord.form.groups && formRecord.form.groups[currentGroup]) {
      const exitUrlEn = formRecord.form.groups[currentGroup].exitUrlEn;
      const exitUrlFr = formRecord.form.groups[currentGroup].exitUrlFr;

      if (language === "en" && exitUrlEn) {
        customExitUrl = exitUrlEn;
      }

      if (language === "fr" && exitUrlFr) {
        customExitUrl = exitUrlFr;
      }
    }

    // Do not show next button for off-board sections
    // Show exit button instead

    return (
      exitUrl && (
        <LinkButton.Primary href={customExitUrl ? customExitUrl : exitUrl}>
          {t("exit", { lng: language })}
        </LinkButton.Primary>
      )
    );
  }

  return (
    <>
      {/* For debugging */}
      <div className="hidden">{`currentGroup=${currentGroup}`}</div>
      <Button
        onClick={async (e) => {
          e.preventDefault();
          if (await handleValidation()) {
            updateFormDelay(formRecord.form, currentGroup);
            handleNextAction();
            tryFocusOnPageLoad("h2");
          }
        }}
      >
        {!saveAndResumeEnabled ? (
          t("next", { lng: language })
        ) : (
          <>
            <span className="hidden tablet:block">{t("next", { lng: language })}</span>
            <span className="block tablet:hidden">
              <ForwardArrowIcon24x24 className="fill-white" />
            </span>
          </>
        )}
      </Button>
    </>
  );
};

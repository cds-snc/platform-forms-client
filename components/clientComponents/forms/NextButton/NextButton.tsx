"use client";

import React from "react";
import { useTranslation } from "@i18n/client";

import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { Validate, PublicFormRecord } from "@lib/types";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Button } from "@clientComponents/globals/Buttons/Button";
import { LockedSections } from "@formBuilder/components/shared/right-panel/treeview/types";
import { ArrowRightNav } from "@serverComponents/icons/ArrowRightNav";
import { Language } from "@lib/types/form-builder-types";

import { getLocalizedProperty } from "@lib/utils";

export const NextButton = ({
  validateForm,
  fallBack,
  language,
  formRecord,
}: {
  validateForm: Validate["validateForm"];
  fallBack?: () => JSX.Element;
  language: Language;
  formRecord: PublicFormRecord;
}) => {
  const { currentGroup, hasNextAction, handleNextAction, isOffBoardSection } = useGCFormsContext();
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
            handleNextAction();
          }
        }}
        type="button"
      >
        <>
          {t("next", { lng: language })} <ArrowRightNav className="ml-4" />
        </>
      </Button>
    </>
  );
};

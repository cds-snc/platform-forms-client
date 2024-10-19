"use client";

import React from "react";
import { useTranslation } from "@i18n/client";

import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { Validate, PublicFormRecord } from "@lib/types";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Button } from "@clientComponents/globals/Buttons/Button";
import { LockedSections } from "@formBuilder/components/shared/right-panel/treeview/types";
import { Language } from "@lib/types/form-builder-types";

import { getLocalizedProperty } from "@lib/utils";
import { showReviewPage } from "@lib/utils/form-builder/showReviewPage";
import { focusElement } from "@lib/client/clientHelpers";
import { SpamButton } from "../Form/SpamButton";

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

  // TODO cache computed value
  let requiredQuestions = 0;
  const groupIds = formRecord?.form?.groups?.[currentGroup].elements;
  if (groupIds) {
    requiredQuestions = formRecord.form.elements
      .filter((element) => groupIds.find((id) => String(id) === String(element.id)))
      .filter((element) => element.properties.validation?.required === true).length;
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
            focusElement("h2");
          }
        }}
      >
        {t("next", { lng: language })}
      </Button>
      requiredQuestions={requiredQuestions}
      <SpamButton
        // numberOfRequiredQuestions={formRecord.form.elements.filter(
        //   (element) => element.properties.validation?.required === true
        // ).length}
        numberOfRequiredQuestions={requiredQuestions}
        formID={formRecord.id}
        formTitle={formRecord.form.titleEn}
        callback={async () => {
          if (await handleValidation()) {
            handleNextAction();
            focusElement("h2");
          }
        }}
      />
    </>
  );
};

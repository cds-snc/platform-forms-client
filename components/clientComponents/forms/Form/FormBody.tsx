import React from "react";
import { RichText } from "@clientComponents/forms";
import { type Language } from "@lib/types/form-builder-types";
import { LOCKED_GROUPS } from "@formBuilder/components/shared/right-panel/headless-treeview/constants";

import { Review } from "../Review/Review";
import { FormActions } from "./FormActions";
import { PrimaryFormButtons } from "./PrimaryFormButtons";
import { type FormRenderProps } from "./types";

const FormIntro = ({
  form,
  language,
}: {
  form: FormRenderProps["formRecord"]["form"];
  language: string;
}) => (
  <>
    <RichText>
      {form.introduction && form.introduction[language == "en" ? "descriptionEn" : "descriptionFr"]}
    </RichText>
    <RichText>
      {form.privacyPolicy &&
        form.privacyPolicy[language == "en" ? "descriptionEn" : "descriptionFr"]}
    </RichText>
  </>
);

export const FormBody = ({
  props,
  formID,
  form,
  dirty,
  currentGroup,
  getGroupTitle,
  isShowReviewPage,
  showIntro,
}: {
  props: FormRenderProps;
  formID: string;
  form: FormRenderProps["formRecord"]["form"];
  dirty: FormRenderProps["dirty"];
  currentGroup: string | null;
  getGroupTitle: (groupId: string | null, language: Language) => string;
  isShowReviewPage: boolean;
  showIntro: boolean;
}) => {
  const { children, handleSubmit, language } = props;
  const showGroupHeading =
    isShowReviewPage &&
    currentGroup !== LOCKED_GROUPS.REVIEW &&
    currentGroup !== LOCKED_GROUPS.START;
  const showReview = isShowReviewPage && currentGroup === LOCKED_GROUPS.REVIEW;

  return (
    <>
      {showIntro && <FormIntro form={form} language={language} />}

      <form id="form" data-testid="form" noValidate={true} onSubmit={handleSubmit}>
        {showGroupHeading && (
          <h2 tabIndex={-1} data-group={currentGroup || "default"} data-testid="focus-h2">
            {getGroupTitle(currentGroup, language as Language)}
          </h2>
        )}

        {children}

        {showReview && <Review language={language as Language} />}

        <FormActions
          saveAndResumeEnabled={props.saveAndResumeEnabled || false}
          formId={formID}
          language={language as Language}
          form={form}
          dirty={dirty}
        >
          <PrimaryFormButtons
            saveAndResumeEnabled={props.saveAndResumeEnabled || false}
            isShowReviewPage={isShowReviewPage}
            language={language}
            props={props}
          />
        </FormActions>
        {props.captchaEnabled && props.captcha}
      </form>
    </>
  );
};

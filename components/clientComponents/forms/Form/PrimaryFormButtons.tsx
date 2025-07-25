import { Language } from "@lib/types/form-builder-types";
import { BackButton } from "@formBuilder/[id]/preview/BackButton";
import { BackButtonGroup } from "../BackButtonGroup/BackButtonGroup";
import { SubmitButton } from "./SubmitButton";
import { InnerFormProps } from "./types";
import { FormStatus } from "@gcforms/types";

const isFormClosed = (status: FormStatus) => {
  return status === FormStatus.FORM_CLOSED_ERROR;
};

export const PrimaryFormButtons = ({
  isGroupsCheck,
  isShowReviewPage,
  language,
  formId,
  formTitle,
  props,
  getFormDelay,
  saveAndResumeEnabled,
}: {
  isGroupsCheck: boolean;
  isShowReviewPage: boolean;
  language: string;
  formId: string;
  formTitle: string;
  props: InnerFormProps;
  getFormDelay: () => number;
  saveAndResumeEnabled?: boolean;
}) => {
  const submissionError =
    Object.entries(props.errors).length > 0 || props.status === FormStatus.ERROR;
  return (
    <div className="flex">
      {isGroupsCheck && isShowReviewPage && (
        <BackButtonGroup
          saveAndResumeEnabled={saveAndResumeEnabled}
          language={language as Language}
        />
      )}
      {props.renderSubmit ? (
        props.renderSubmit({
          validateForm: props.validateForm,
          fallBack: () => {
            return (
              <div className="flex">
                {isGroupsCheck && isShowReviewPage && (
                  <BackButton
                    saveAndResumeEnabled={saveAndResumeEnabled}
                    language={language as Language}
                  />
                )}
                <SubmitButton
                  disabled={isFormClosed(props.status)}
                  getFormDelay={getFormDelay}
                  formID={formId}
                  formTitle={formTitle}
                  submissionError={submissionError}
                />
              </div>
            );
          },
        })
      ) : (
        <SubmitButton
          disabled={isFormClosed(props.status)}
          getFormDelay={getFormDelay}
          formID={formId}
          formTitle={formTitle}
          submissionError={submissionError}
        />
      )}
    </div>
  );
};

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
  isShowReviewPage,
  language,
  props,
  saveAndResumeEnabled,
}: {
  isShowReviewPage: boolean;
  language: string;
  props: InnerFormProps;
  saveAndResumeEnabled?: boolean;
}) => {
  const submissionError =
    Object.entries(props.errors).length > 0 || props.status === FormStatus.ERROR;
  return (
    <div className="flex">
      {isShowReviewPage && (
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
                {isShowReviewPage && (
                  <BackButton
                    saveAndResumeEnabled={saveAndResumeEnabled}
                    language={language as Language}
                  />
                )}
                <SubmitButton
                  disabled={isFormClosed(props.status)}
                  submissionError={submissionError}
                />
              </div>
            );
          },
        })
      ) : (
        <SubmitButton disabled={isFormClosed(props.status)} submissionError={submissionError} />
      )}
    </div>
  );
};

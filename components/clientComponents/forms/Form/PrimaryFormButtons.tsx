import { Language } from "@lib/types/form-builder-types";
import { BackButton } from "@formBuilder/[id]/preview/BackButton";
import { BackButtonGroup } from "../BackButtonGroup/BackButtonGroup";
import { SubmitButton } from "./SubmitButton";
import { InnerFormProps } from "./types";
import { tryFocusOnPageLoad } from "@lib/client/clientHelpers";

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
  return (
    <div className="flex">
      {isGroupsCheck && isShowReviewPage && (
        <BackButtonGroup
          saveAndResumeEnabled={saveAndResumeEnabled}
          language={language as Language}
          onClick={() => tryFocusOnPageLoad("h2")}
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
                    onClick={() => tryFocusOnPageLoad("h2")}
                  />
                )}
                <SubmitButton getFormDelay={getFormDelay} formID={formId} formTitle={formTitle} />
              </div>
            );
          },
        })
      ) : (
        <SubmitButton getFormDelay={getFormDelay} formID={formId} formTitle={formTitle} />
      )}
    </div>
  );
};

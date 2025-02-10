import { Language } from "@lib/types/form-builder-types";
import { BackButton } from "@formBuilder/[id]/preview/BackButton";
import { BackButtonGroup } from "../BackButtonGroup/BackButtonGroup";
import { SubmitButton } from "./SubmitButton";
import { InnerFormProps } from "./types";

export const PrimaryFormButtons = ({
  isGroupsCheck,
  isShowReviewPage,
  groupsHeadingRef,
  language,
  formId,
  formTitle,
  props,
  getFormDelay,
  saveAndResumeEnabled,
}: {
  isGroupsCheck: boolean;
  isShowReviewPage: boolean;
  groupsHeadingRef: React.RefObject<HTMLHeadingElement | null>;
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
          language={language as Language}
          onClick={() => groupsHeadingRef.current?.focus()}
        />
      )}
      {props.renderSubmit ? (
        props.renderSubmit({
          validateForm: props.validateForm,
          fallBack: () => {
            return (
              <div>
                {isGroupsCheck && isShowReviewPage && (
                  <BackButton
                    saveAndResumeEnabled={saveAndResumeEnabled}
                    language={language as Language}
                    onClick={() => groupsHeadingRef.current?.focus()}
                  />
                )}
                <div className="inline-block">
                  <SubmitButton getFormDelay={getFormDelay} formID={formId} formTitle={formTitle} />
                </div>
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

"use client";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Form } from "@clientComponents/forms/Form/Form";
import { NextButton } from "@clientComponents/forms/NextButton/NextButton";
import { tryFocusOnPageLoad } from "@lib/client/clientHelpers";
import { BackButton } from "./BackButton";
import { Button } from "@clientComponents/globals";
import Markdown from "markdown-to-jsx";
import { showReviewPage } from "@lib/utils/form-builder/showReviewPage";
import { useTranslation } from "@i18n/client";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useSession } from "next-auth/react";
import { FormRecord } from "@gcforms/types";
import { TypeOmit } from "@lib/types";

// Component created to allow access to the parent GCFormsProvider context
export const PreviewFormWrapper = ({
  children,
  formRecord,
  disableSubmit,
  allowGrouping,
  setSent,
}: {
  children: React.JSX.Element[];
  formRecord: TypeOmit<FormRecord, "name" | "deliveryOption">;
  allowGrouping: boolean;
  disableSubmit: boolean;
  setSent: React.Dispatch<React.SetStateAction<string | null | undefined>>;
}) => {
  const { status } = useSession();
  const { saveSessionProgress, currentGroup } = useGCFormsContext();

  const { translationLanguagePriority, getLocalizationAttribute } = useTemplateStore((s) => ({
    translationLanguagePriority: s.translationLanguagePriority,
    getLocalizationAttribute: s.getLocalizationAttribute,
  }));

  const translationNamespaces = ["common", "form-builder", "form-closed"];
  const { t } = useTranslation(translationNamespaces);
  const translatedT = useTranslation(translationNamespaces, { lng: translationLanguagePriority }).t;

  const isShowReviewPage = showReviewPage(formRecord.form);

  return (
    <Form
      formRecord={formRecord}
      saveSessionProgress={saveSessionProgress}
      isPreview={true}
      language={translationLanguagePriority}
      t={translatedT}
      onSuccess={setSent}
      renderSubmit={({ validateForm }) => {
        return (
          <div id="PreviewSubmitButton">
            <span {...getLocalizationAttribute()}>
              <NextButton
                formRecord={formRecord}
                language={translationLanguagePriority}
                validateForm={validateForm}
                fallBack={() => {
                  return (
                    <>
                      {allowGrouping && isShowReviewPage && (
                        <BackButton
                          language={translationLanguagePriority}
                          onClick={() => tryFocusOnPageLoad("h2")}
                        />
                      )}
                      <Button
                        type="submit"
                        id="SubmitButton"
                        onClick={(e) => {
                          if (disableSubmit) {
                            e.preventDefault();
                          }
                        }}
                      >
                        {t("submitButton", { ns: "common", lng: translationLanguagePriority })}
                      </Button>
                    </>
                  );
                }}
              />
            </span>
            {status !== "authenticated" && (
              <div className="inline-block bg-purple-200 px-4 py-1" {...getLocalizationAttribute()}>
                <Markdown options={{ forceBlock: true }}>
                  {t("signInToTest", { ns: "form-builder", lng: translationLanguagePriority })}
                </Markdown>
              </div>
            )}
          </div>
        );
      }}
      allowGrouping={allowGrouping}
      currentGroup={currentGroup}
    >
      {children}
    </Form>
  );
};

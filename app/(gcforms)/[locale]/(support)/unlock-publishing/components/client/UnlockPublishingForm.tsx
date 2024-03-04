"use client";
import React, { useState } from "react";
import { Formik } from "formik";
import {
  TextInput,
  Label,
  Alert,
  ErrorListItem,
  Description,
  TextArea,
} from "@clientComponents/forms";
import { useTranslation } from "@i18n/client";
import * as Yup from "yup";
import { isValidGovEmail } from "@lib/validation";
import { logMessage } from "@lib/logger";
import { useSession } from "next-auth/react";
import { ErrorStatus } from "@clientComponents/forms/Alert/Alert";
import { ErrorPanel } from "@clientComponents/globals/ErrorPanel";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { Button } from "@clientComponents/globals";
import { useRouter } from "next/navigation";
import { unlockPublishing } from "../../actions";

export const UnlockPublishingForm = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation("unlock-publishing");
  const router = useRouter();
  const [errorState, setErrorState] = useState({ message: "" });
  const [submitting, setSubmitting] = useState(false);
  const { data: session } = useSession();

  const validationSchema = Yup.object().shape({
    department: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .max(50, t("signUpRegistration.fields.name.error.maxLength")),
    managerEmail: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .email(t("input-validation.email", { ns: "common" }))
      .test(
        "managerEmail-govEmail",
        t("input-validation.validGovEmail", { ns: "common" }),
        (value = "") => isValidGovEmail(value)
      )
      .test(
        "managerEmail-notSameAsUserEmail",
        t("input-validation.notSameAsUserEmail", { ns: "common" }),
        (value) => value?.toUpperCase() != session?.user?.email?.toUpperCase()
      ),
    goals: Yup.string().required(t("input-validation.required", { ns: "common" })),
  });

  return (
    <Formik
      initialValues={{ managerEmail: "", department: "", goals: "" }}
      onSubmit={async ({ managerEmail, department, goals }) => {
        setSubmitting(true);
        try {
          const response = await unlockPublishing({ managerEmail, department, goals, language });
          setSubmitting(false);
          if (response?.status !== 200) {
            throw new Error(t("submissionError"));
          }
          setErrorState({ message: "" });
          router.replace(`/${language}/unlock-publishing?success`);
        } catch (err) {
          logMessage.error(err);
          setSubmitting(false);
          setErrorState({ message: t("submissionError") });
        }
      }}
      validateOnChange={false}
      validateOnBlur={false}
      validationSchema={validationSchema}
    >
      {({ handleSubmit, errors }) => (
        <>
          {errorState.message && (
            <ErrorPanel supportLink={false}>{t("server-error", { ns: "common" })}</ErrorPanel>
          )}

          {!errorState.message && (
            <>
              {Object.keys(errors).length > 0 && (
                <Alert
                  type={ErrorStatus.ERROR}
                  validation={true}
                  tabIndex={0}
                  id="unlockPublishingValidationErrors"
                  heading={t("input-validation.heading", { ns: "common" })}
                >
                  <ol className="gc-ordered-list">
                    {Object.entries(errors).map(([fieldKey, fieldValue]) => {
                      return (
                        <ErrorListItem
                          key={`error-${fieldKey}`}
                          errorKey={fieldKey}
                          value={fieldValue}
                        />
                      );
                    })}
                  </ol>
                </Alert>
              )}
              <form id="unlock-publishing" method="POST" onSubmit={handleSubmit} noValidate>
                <div className="focus-group">
                  <Label
                    id={"label-managerEmail"}
                    htmlFor={"managerEmail"}
                    className="required"
                    required
                  >
                    {t("unlockPublishing.form.field1.title")}
                  </Label>
                  <Description id={"unlock-publishing-description"}>
                    {t("unlockPublishing.form.field1.description")}
                  </Description>
                  <TextInput
                    type={"text"}
                    id={"managerEmail"}
                    name={"managerEmail"}
                    className="required w-[34rem]"
                    ariaDescribedBy={"unlock-publishing-description"}
                  />
                </div>

                <div className="focus-group">
                  <Label
                    id={"label-department"}
                    htmlFor={"department"}
                    className="required"
                    required
                  >
                    {t("unlockPublishing.form.field2.title")}
                  </Label>
                  <TextInput
                    type={"text"}
                    id={"department"}
                    name={"department"}
                    className="required w-[34rem]"
                    required
                  />
                </div>

                <div className="focus-group">
                  <Label id={"label-goals"} htmlFor={"goals"} className="required" required>
                    {t("unlockPublishing.form.field3.title")}
                  </Label>
                  <TextArea
                    id={"goals"}
                    name={"goals"}
                    className="required mt-4 w-[34rem]"
                    required
                  />
                </div>

                <div className="mt-14 flex gap-4">
                  <Button
                    type="submit"
                    data-submit="unlock-publishing"
                    theme="primary"
                    disabled={submitting}
                  >
                    {t("submitButton", { ns: "common" })}
                  </Button>

                  <LinkButton.Secondary href={`/${language}/forms/`}>
                    {t("unlockPublishing.skipStepButton")}
                  </LinkButton.Secondary>
                </div>
              </form>
            </>
          )}
        </>
      )}
    </Formik>
  );
};

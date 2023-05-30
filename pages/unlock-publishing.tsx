import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth/auth";
import { checkPrivilegesAsBoolean } from "@lib/privileges";

import React, { useState } from "react";
import Head from "next/head";
import { Formik } from "formik";
import {
  Button,
  TextInput,
  Label,
  Alert,
  ErrorListItem,
  Description,
  TextArea,
} from "@components/forms";
import { useTranslation } from "next-i18next";
import * as Yup from "yup";
import { isValidGovEmail } from "@lib/validation";
import { logMessage } from "@lib/logger";
import { StyledLink } from "@components/globals/StyledLink/StyledLink";
import axios from "axios";
import { useSession } from "next-auth/react";
import { ErrorStatus } from "@components/forms/Alert/Alert";

export default function UnlockPublishing() {
  const { t, i18n } = useTranslation(["unlock-publishing", "common"]);
  const [errorState, setErrorState] = useState({ message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [hasRequestedPublishing, setHasRequestedPublishing] = useState(false);

  const { data: session } = useSession();

  const handleRequestPublishing = async (
    managerEmail: string,
    department: string,
    goals: string
  ) => {
    return await axios({
      url: "/api/request/publish",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: { managerEmail, department, goals },
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
    }).catch((err) => {
      logMessage.error(err);
      setErrorState({ message: t("submissionError") });
    });
  };

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
    <div aria-live="polite">
      {!hasRequestedPublishing && (
        <>
          <Head>
            <title>{t("unlockPublishing.title")}</title>
          </Head>
          <Formik
            initialValues={{ managerEmail: "", department: "", goals: "" }}
            onSubmit={async ({ managerEmail, department, goals }) => {
              setSubmitting(true);
              try {
                const response = await handleRequestPublishing(managerEmail, department, goals);
                setSubmitting(false);
                if (response?.status !== 200) {
                  throw new Error(t("submissionError"));
                }
                setErrorState({ message: "" });
                // Shows success screen
                setHasRequestedPublishing(true);
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
                  <Alert
                    type={ErrorStatus.ERROR}
                    validation={true}
                    tabIndex={0}
                    id="unlockPublishingSubmissionError"
                    heading={t("input-validation.heading", { ns: "common" })}
                  >
                    {errorState.message}
                  </Alert>
                )}

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

                <h1>{t("unlockPublishing.title")}</h1>
                <p className="mb-14">{t("unlockPublishing.paragraph1")}</p>

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
                      className="required w-[34rem] mt-4"
                      required
                      characterCountMessages={{
                        part1: t("formElements.characterCount.part1"),
                        part2: t("formElements.characterCount.part2"),
                        part1Error: t("formElements.characterCount.part1-error"),
                        part2Error: t("formElements.characterCount.part2-error"),
                      }}
                    />
                  </div>

                  <div className="flex mt-14">
                    <Button
                      type="submit"
                      className={` 
                          mr-8
                          bg-blue-dark text-white-default border-black-default py-4 px-8 rounded-lg border-2 border-solid
                          hover:text-white-default hover:bg-blue-light active:text-white-default active:bg-blue-active active:top-0.5
                          focus:outline-[3px] focus:outline-blue-focus focus:outline focus:outline-offset-2 focus:bg-blue-focus focus:text-white-default disabled:cursor-not-allowed disabled:text-gray-500
                        `}
                      disabled={submitting}
                    >
                      {t("submitButton", { ns: "common" })}
                    </Button>
                    <StyledLink
                      href={`/${i18n.language}/myforms/`}
                      className={` 
                            no-underline visited:text-black-default 
                            bg-white-default text-black-default border-black-default py-4 px-8 rounded-lg border-2 border-solid
                            hover:text-white-default hover:bg-blue-light active:text-white-default active:bg-blue-active active:top-0.5
                            focus:outline-[3px] focus:outline-blue-focus focus:outline focus:outline-offset-2 focus:bg-blue-focus focus:text-white-default disabled:cursor-not-allowed disabled:text-gray-500
                          `}
                    >
                      {t("unlockPublishing.skipStepButton")}
                    </StyledLink>
                  </div>
                </form>
              </>
            )}
          </Formik>
        </>
      )}
      {hasRequestedPublishing && (
        <>
          <Head>
            <title>{t("unlockPublishingSubmitted.title")}</title>
          </Head>
          <h1>{t("unlockPublishingSubmitted.title")}</h1>
          <h2>{t("unlockPublishingSubmitted.whatNext.title")}</h2>
          <p>{t("unlockPublishingSubmitted.whatNext.paragraph1")}</p>
          <p className="mt-8 font-bold">{t("unlockPublishingSubmitted.whatNext.paragraph2")}</p>
          <p>{t("unlockPublishingSubmitted.whatNext.paragraph3")}</p>
          <p className="mt-8">{t("unlockPublishingSubmitted.whatNext.paragraph4")}</p>
          <div className="flex mt-14">
            <StyledLink
              href={`/${i18n.language}/myforms/`}
              className={` 
                no-underline visited:text-white-default mr-8
                bg-blue-dark text-white-default border-black-default py-4 px-8 rounded-lg border-2 border-solid
                hover:text-white-default hover:bg-blue-light active:text-white-default active:bg-blue-active active:top-0.5
                focus:outline-[3px] focus:outline-blue-focus focus:outline focus:outline-offset-2 focus:bg-blue-focus focus:text-white-default disabled:cursor-not-allowed disabled:text-gray-500
              `}
            >
              {t("continue", { ns: "common" })}
            </StyledLink>
          </div>
        </>
      )}
    </div>
  );
}

export const getServerSideProps = requireAuthentication(async ({ user: { ability }, locale }) => {
  {
    // If the user already has the Publishing Privilege redirect back to MyForms
    if (
      checkPrivilegesAsBoolean(ability, [
        { action: "update", subject: "FormRecord", field: "isPublished" },
      ])
    ) {
      return {
        redirect: {
          destination: `${locale}/myforms`,
          permanent: false,
        },
      };
    }

    return {
      props: {
        ...(locale && (await serverSideTranslations(locale, ["unlock-publishing", "common"]))),
      },
    };
  }
});

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { checkPrivileges } from "@lib/privileges";

import React, { useState } from "react";
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
import emailDomainList from "../email.domains.json";
import { logMessage } from "@lib/logger";
import Link from "next/link";

export default function UnlockPublishing() {
  const { t, i18n } = useTranslation(["unlock-publishing", "common"]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validationSchema = Yup.object().shape({
    department: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .max(50, t("signUpRegistration.fields.name.error.maxLength")),
    username: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .email(t("input-validation.email", { ns: "common" }))
      .test(
        "username-govEmail",
        t("input-validation.validGovEmail", { ns: "common" }),
        (value = "") => isValidGovEmail(value, emailDomainList.domains)
      ),
    goals: Yup.string().required(t("input-validation.required", { ns: "common" })),
  });

  return (
    <>
      {!isSubmitted && (
        <>
          <Formik
            initialValues={{ username: "", department: "", goal: "" }}
            onSubmit={(values) => {
              // Shows success screen
              setIsSubmitted(true);

              // TODO: API Call
              logMessage.info(values);
            }}
            validateOnChange={false}
            validateOnBlur={false}
            validationSchema={validationSchema}
          >
            {({ handleSubmit, errors }) => (
              <>
                {Object.keys(errors).length > 0 && (
                  <Alert
                    type="error"
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
                    <Label id={"label-username"} htmlFor={"username"} className="required" required>
                      {t("unlockPublishing.form.field1.title")}
                    </Label>
                    <Description id={"unlock-publishing-description"}>
                      {t("unlockPublishing.form.field1.description")}
                    </Description>
                    <TextInput
                      type={"text"}
                      id={"username"}
                      name={"username"}
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
                      className="required"
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
                      className="required"
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
                    >
                      {t("submitButton", { ns: "common" })}
                    </Button>
                    <Link href={`/${i18n.language}/myforms/`}>
                      <a
                        className={` 
                          no-underline visited:text-black-default 
                          bg-white-default text-black-default border-black-default py-4 px-8 rounded-lg border-2 border-solid
                          hover:text-white-default hover:bg-blue-light active:text-white-default active:bg-blue-active active:top-0.5
                          focus:outline-[3px] focus:outline-blue-focus focus:outline focus:outline-offset-2 focus:bg-blue-focus focus:text-white-default disabled:cursor-not-allowed disabled:text-gray-500
                        `}
                      >
                        {t("unlockPublishing.skipStepButton")}
                      </a>
                    </Link>
                  </div>
                </form>
              </>
            )}
          </Formik>
        </>
      )}
      {isSubmitted && (
        <>
          <h1>{t("unlockPublishingSubmitted.title")}</h1>
          <h2>{t("unlockPublishingSubmitted.whatNext.title")}</h2>
          <p>{t("unlockPublishingSubmitted.whatNext.paragraph1")}</p>
          <p className="mt-8 font-bold">{t("unlockPublishingSubmitted.whatNext.paragraph2")}</p>
          <p>{t("unlockPublishingSubmitted.whatNext.paragraph3")}</p>
          <p className="mt-8">{t("unlockPublishingSubmitted.whatNext.paragraph4")}</p>
          <div className="flex mt-14">
            <Link href={`/${i18n.language}/myforms/`}>
              <a
                className={` 
                  no-underline visited:text-white-default mr-8
                  bg-blue-dark text-white-default border-black-default py-4 px-8 rounded-lg border-2 border-solid
                  hover:text-white-default hover:bg-blue-light active:text-white-default active:bg-blue-active active:top-0.5
                  focus:outline-[3px] focus:outline-blue-focus focus:outline focus:outline-offset-2 focus:bg-blue-focus focus:text-white-default disabled:cursor-not-allowed disabled:text-gray-500
                `}
              >
                {t("continue", { ns: "common" })}
              </a>
            </Link>
          </div>
        </>
      )}
    </>
  );
}

export const getServerSideProps = requireAuthentication(async ({ user: { ability }, locale }) => {
  {
    checkPrivileges(ability, [{ action: "view", subject: "FormRecord" }]);

    return {
      props: {
        ...(locale && (await serverSideTranslations(locale, ["unlock-publishing", "common"]))),
      },
    };
  }
});

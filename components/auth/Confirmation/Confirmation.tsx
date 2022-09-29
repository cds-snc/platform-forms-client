import React, { ReactElement } from "react";
import { Formik } from "formik";
import { Button, TextInput, Label } from "@components/forms";
import { useAuth } from "@lib/hooks";
import { useTranslation } from "next-i18next";

export interface ConfirmationProps {
  /**
   * The email of the user being confirmed.
   */
  username: string;
}

export const Confirmation = ({ username }: ConfirmationProps): ReactElement => {
  const { confirm, resendConfirmationCode } = useAuth();
  const { t } = useTranslation(["signup", "common"]);
  if (!username) {
    return <p>{t("signUpConfirmation.noUsername")}</p>;
  }
  return (
    <Formik initialValues={{ username: username, confirmationCode: "" }} onSubmit={confirm}>
      {({ handleSubmit }) => (
        <>
          <h1>{t("signUpConfirmation.title")}</h1>
          <form id="confirmation" method="POST" onSubmit={handleSubmit}>
            <div className="focus-group">
              <Label id={"label-1"} htmlFor={"1"} className="required">
                {t("signUpConfirmation.fields.confirmationCode.label")}
              </Label>
              <TextInput
                type={"text"}
                id={"1"}
                name={"confirmationCode"}
                characterCountMessages={{
                  part1: t("formElements.characterCount.part1", { ns: "common" }),
                  part2: t("formElements.characterCount.part2", { ns: "common" }),
                  part1Error: t("formElements.characterCount.part1-error", { ns: "common" }),
                  part2Error: t("formElements.characterCount.part2-error", { ns: "common" }),
                }}
              />
            </div>
            <div className="buttons">
              <Button
                type="button"
                onClick={async () => {
                  await resendConfirmationCode(username);
                }}
                secondary
              >
                {t("signUpConfirmation.resendConfirmationCodeButton")}
              </Button>
              <Button type="submit">{t("submitButton", { ns: "common" })}</Button>
            </div>
          </form>
        </>
      )}
    </Formik>
  );
};

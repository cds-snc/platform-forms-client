import { Button } from "@components/forms";
import { logMessage } from "@lib/logger";
import Loader from "@components/globals/Loader";
import { FormOwner } from "@lib/types";
import axios from "axios";
import { useTranslation } from "next-i18next";
import React, { useEffect, useState } from "react";
import { isValidGovEmail } from "@lib/validation";
import emailDomainList from "../../../email.domains.json";

export interface FormAccessProps {
  formID: number;
}

const FormAccess = (props: FormAccessProps): React.ReactElement => {
  const { formID } = props;
  const [formOwners, setFormOwners] = useState([] as FormOwner[]);
  const { t } = useTranslation("admin-templates");
  const [errorState, setErrorState] = useState({ message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getFormOwners();
  }, []);

  const ownersApiUrl = `/api/id/${formID}/owners`;

  const getFormOwners = async () => {
    try {
      setSubmitting(true);
      setErrorState({ message: "" });
      const serverResponse = await axios({
        url: ownersApiUrl,
        method: "GET",
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });
      setFormOwners(serverResponse.data as unknown as FormOwner[]);
    } catch (err) {
      logMessage.error(err as Error);
      setErrorState({ message: t("settings.formAccess.formOwnersError") });
    } finally {
      setSubmitting(false);
    }
  };

  const addEmailToForm = async (email: string) => {
    try {
      setSubmitting(true);
      setErrorState({ message: "" });
      const serverResponse = await axios({
        url: ownersApiUrl,
        method: "POST",
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
        data: {
          email: email,
        },
      });
      if (serverResponse.status === 200) {
        setFormOwners([...formOwners, { id: formID, email: email, active: true }]);
      }
    } catch (err) {
      logMessage.error(err as Error);
      setErrorState({ message: "Unable to add user to form." });
    } finally {
      setSubmitting(false);
    }
  };

  const activateOrDeactivateFormOwners = async (email: string, active: boolean) => {
    try {
      setSubmitting(true);
      setErrorState({ message: "" });
      const serverResponse = await axios({
        url: ownersApiUrl,
        method: "PUT",
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
        data: {
          email: email,
          active: active,
        },
      });
      if (serverResponse.status === 200) {
        setFormOwners(
          formOwners.filter((formOwner) => {
            return formOwner.email !== email;
          })
        );
      }
    } catch (err) {
      logMessage.error(err as Error);
      setErrorState({ message: t("settings.bearerTokenRefreshError") });
    } finally {
      setSubmitting(false);
    }
  };

  const formOwnerUI = () => {
    return formOwners.map((formOwner) => {
      if (formOwner.active) {
        return (
          <>
            <p key={formOwner.id}>{formOwner.email}</p>
            <Button
              type="button"
              destructive={true}
              onClick={() => activateOrDeactivateFormOwners(formOwner.email, false)}
            >
              X
            </Button>
          </>
        );
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEmail = e.target.newFormOwnerEmail.value;
    if (isValidGovEmail(newEmail, emailDomainList.domains)) {
      addEmailToForm(newEmail);
    }
  };

  return (
    <>
      {submitting ? (
        <Loader message="Loading..." />
      ) : (
        <>
          {errorState.message ? (
            <p role="alert" data-testid="alert">
              {errorState.message}
            </p>
          ) : null}
          <h2>Form Access</h2>
          {formOwnerUI()}
          <hr />
          <form onSubmit={handleSubmit}>
            <input className={"gc-input-text"} type="text" name="newFormOwnerEmail" />
            <button type="submit" className="gc-button" data-testid="upload">
              Add Email
            </button>
          </form>
        </>
      )}
    </>
  );
};

export default FormAccess;

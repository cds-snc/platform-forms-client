import { Button } from "@components/forms";
import { logMessage } from "@lib/logger";
import Loader from "@components/globals/Loader";
import axios from "axios";
import { useTranslation } from "next-i18next";
import React, { useEffect, useState } from "react";
import { isValidGovEmail } from "@lib/validation";
import { FormOwner } from "@lib/types";

export interface FormAccessProps {
  formID: string;
}

const FormAccess = (props: FormAccessProps): React.ReactElement => {
  const { formID } = props;
  const [formOwners, setFormOwners] = useState([] as FormOwner[]);
  const { t } = useTranslation("admin-templates");
  const [errorState, setErrorState] = useState({ message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [newEmail, setNewEmail] = useState("");

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
      await axios({
        url: ownersApiUrl,
        method: "POST",
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
        data: {
          email: email,
        },
      });
      setFormOwners([...formOwners, { id: formID, email: email, active: true }]);
      setNewEmail("");
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
        const updatedFormOwnerIndex = formOwners.findIndex(
          (formOwner) => formOwner.email === email
        );
        const newFormOwners = [...formOwners];
        newFormOwners[updatedFormOwnerIndex] = {
          ...newFormOwners[updatedFormOwnerIndex],
          active: active,
        };
        setFormOwners(newFormOwners);
      } else {
        setErrorState({ message: t("settings.formAccess.updateError") });
      }
    } catch (err) {
      logMessage.error(err as Error);
      setErrorState({ message: t("settings.formAccess.updateError") });
    } finally {
      setSubmitting(false);
    }
  };

  const formOwnerUI = (owners: FormOwner[]) => {
    if (owners.length < 1) return;
    return owners.map((owner) => {
      return (
        <li key={owner.id} className="flex items-center">
          <Button
            type="submit"
            onClick={() => activateOrDeactivateFormOwners(owner.email, !owner.active)}
          >
            {owner.active ? t("disable") : t("enable")}
          </Button>
          <p className="ml-4">{owner.email}</p>
        </li>
      );
    });
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorState({ message: "" });
    if (isValidGovEmail(newEmail)) {
      addEmailToForm(newEmail);
    } else {
      setErrorState({ message: t("settings.formAccess.invalidEmailError") });
    }
  };

  const handleEmailInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewEmail(event.target.value);
  };

  return (
    <>
      {submitting ? (
        <Loader message="Loading..." />
      ) : (
        <>
          {errorState.message && (
            <p role="alert" data-testid="alert">
              {errorState.message}
            </p>
          )}
          <ul className="space-y-4">{formOwnerUI(formOwners)}</ul>
          <hr />
          <form onSubmit={handleEmailSubmit} className="flex items-center">
            <input
              className="mb-2 gc-input-text mr-2"
              type="text"
              name="newFormOwnerEmail"
              onChange={handleEmailInputChange}
              defaultValue={newEmail}
              aria-label={t("settings.formAccess.addEmailAriaLabel")}
            />
            <Button type="submit" disabled={newEmail === ""} testid="add-email">
              {t("settings.formAccess.addEmailButton")}
            </Button>
          </form>
        </>
      )}
    </>
  );
};

export default FormAccess;

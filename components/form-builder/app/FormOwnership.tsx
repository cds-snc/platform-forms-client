import React, { ReactElement, useId, useState } from "react";
import { useTranslation } from "next-i18next";
import { Alert } from "@components/forms";
import { ErrorStatus } from "@components/forms/Alert/Alert";
import { logMessage } from "@lib/logger";
import { Button } from "@components/globals";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import axios from "axios";
import { FormRecord } from "@lib/types";

interface User {
  id: string;
  name: string | null;
  email: string | null;
}

interface AssignUsersToTemplateProps {
  formRecord: FormRecord;
  usersAssignedToFormRecord: User[];
  allUsers: User[];
}

const usersToOptions = (users: User[]): { value: string; label: string | null }[] => {
  return users.map((user) => {
    return { value: user.id, label: user.email };
  });
};

const updateUsersToTemplateAssignations = async (formID: string, users: { id: string }[]) => {
  try {
    return await axios({
      url: `/api/templates/${formID}`,
      method: "PUT",
      data: {
        users,
      },
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
    });
  } catch (e) {
    logMessage.error(e);
  }
};

export const FormOwnership = ({
  formRecord,
  usersAssignedToFormRecord,
  allUsers,
}: AssignUsersToTemplateProps) => {
  const { t } = useTranslation(["admin-users", "form-builder"]);

  const [message, setMessage] = useState<ReactElement | null>(null);
  const assignedToFormRecord = usersToOptions(usersAssignedToFormRecord);
  const [selectedUsers, setSelectedUsers] =
    useState<{ value: string; label: string | null }[]>(assignedToFormRecord);

  const saveAssignations = async () => {
    setMessage(null);
    const usersToAssign: { id: string }[] = selectedUsers.map((user) => {
      return { id: user.value };
    });

    const response = await updateUsersToTemplateAssignations(formRecord.id, usersToAssign);

    if (response && response.data.error) {
      setMessage(
        <Alert
          type={ErrorStatus.ERROR}
          focussable={true}
          heading={t("responseFail.title")}
          tabIndex={0}
          className="mb-2"
        >
          {t(response.data.message)}
        </Alert>
      );
      return;
    }

    if (response && response.status === 200) {
      setMessage(
        <Alert
          type={ErrorStatus.SUCCESS}
          focussable={true}
          heading={t("responseSuccess.title")}
          tabIndex={0}
          className="mb-2"
        >
          {t("responseSuccess.message")}
        </Alert>
      );
      return response.data;
    }

    setMessage(
      <Alert
        type={ErrorStatus.ERROR}
        focussable={true}
        heading={t("responseFail.title")}
        tabIndex={0}
        className="mb-2"
      >
        {t("responseFail.message")}
      </Alert>
    );
  };

  return (
    <>
      <div className="mb-20">
        <h2>{t("Manage ownership")}</h2>

        {message && message}

        <p className="mb-4">{t("assignUsersToTemplate")}</p>
        <p className="mb-2 font-bold">{t("enterOwnersEmail")} </p>
        <Select
          instanceId={useId()}
          isClearable
          isSearchable
          isMulti
          components={makeAnimated()}
          options={usersToOptions(allUsers)}
          value={selectedUsers}
          onChange={(value) => setSelectedUsers(value as { value: string; label: string | null }[])}
        />
        <br />
        <Button
          dataTestId="save-ownership"
          theme="secondary"
          type="submit"
          onClick={() => saveAssignations()}
        >
          {t("save")}
        </Button>
      </div>
    </>
  );
};

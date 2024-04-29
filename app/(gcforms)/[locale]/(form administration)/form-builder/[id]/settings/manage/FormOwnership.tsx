"use client";
import React, { ReactElement, useState } from "react";
import { useTranslation } from "@i18n/client";
import { Alert } from "@clientComponents/globals";
import { logMessage } from "@lib/logger";
import { Button } from "@clientComponents/globals";
import { FormOwnerSelect, usersToOptions } from "./FormOwnerSelect";

import { CacheProvider, EmotionCache } from "@emotion/react";
import createCache from "@emotion/cache";
import axios from "axios";
import { FormRecord } from "@lib/types";

interface AssignUsersToTemplateProps {
  nonce: string | null;
  formRecord: FormRecord;
  usersAssignedToFormRecord: { id: string; name: string | null; email: string }[];
  allUsers: { id: string; name: string | null; email: string }[];
}

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
  nonce,
  formRecord,
  usersAssignedToFormRecord,
  allUsers,
}: AssignUsersToTemplateProps) => {
  const { t } = useTranslation(["admin-users", "form-builder"]);

  const cache: EmotionCache = createCache({
    key: "gc-forms",
    nonce: nonce || "xyz123",
  });

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
        <Alert.Danger focussable={true} title={t("responseFail.title")} className="mb-2">
          <p>{t(response.data.message)}</p>
        </Alert.Danger>
      );
      return;
    }

    if (response && response.status === 200) {
      setMessage(
        <Alert.Success focussable={true} title={t("responseSuccess.title")} className="mb-2">
          <p>{t("responseSuccess.message")}</p>
        </Alert.Success>
      );
      return response.data;
    }

    setMessage(
      <Alert.Danger focussable={true} title={t("responseFail.title")} className="mb-2">
        <p>{t("responseFail.message")}</p>
      </Alert.Danger>
    );
  };

  return (
    <>
      <div className="mb-20" data-testid="form-ownership">
        <h2>{t("Manage ownership")}</h2>
        {message && message}
        <p className="mb-4">{t("assignUsersToTemplate")}</p>
        <p className="mb-2 font-bold">{t("enterOwnersEmail")} </p>
        <div className="w-9/12">
          <CacheProvider value={cache}>
            <FormOwnerSelect
              allUsers={allUsers}
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
            />
          </CacheProvider>
        </div>
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

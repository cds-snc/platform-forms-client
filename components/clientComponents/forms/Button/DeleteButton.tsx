"use client";
import React, { useState } from "react";
import { Button } from "@clientComponents/forms";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { logMessage } from "@lib/logger";

interface DeleteButtonProps {
  action(data?: unknown): Promise<number>;
  data?: unknown;
  redirect?: string;
}

export const DeleteButton = (props: DeleteButtonProps): React.ReactElement => {
  const router = useRouter();
  const { t } = useTranslation("admin-templates");
  const [deleteVisible, setDeleteVisible] = useState(false);

  const { action, data, redirect } = props;

  const deleteButton = deleteVisible ? (
    <>
      <p>{t("settings.delete-check")}</p>
      <Button
        onClick={async () => {
          try {
            const resp = await action(data);
            if (resp == 200) {
              redirect && router.push(redirect);
            } else {
              // Todo show error message on page
              // Error should be logged already in its own action
              return;
            }
          } catch (e) {
            logMessage.error(e as Error);
          }
        }}
        testid="confirmDelete"
        type="button"
        destructive={true}
      >
        {t("settings.confirm-delete")}
      </Button>
    </>
  ) : (
    ""
  );

  return (
    <>
      <Button
        type="button"
        testid="delete"
        destructive={true}
        onClick={() => {
          setDeleteVisible(!deleteVisible);
        }}
      >
        {t("settings.delete")}
      </Button>
      <div>{deleteButton}</div>
    </>
  );
};

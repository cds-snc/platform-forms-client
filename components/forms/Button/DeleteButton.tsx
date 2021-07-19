import React, { useState } from "react";
import { Button } from "./Button";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

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
              router.push({
                pathname: redirect,
              });
            } else {
              // Todo show error message on page
              // Error should be logged already in its own action
              return;
            }
          } catch (e) {
            console.error(e);
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

export default DeleteButton;

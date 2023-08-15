import React from "react";
import useSWR from "swr";
import { useTranslation } from "next-i18next";
import { FormElementTypes } from "@lib/types";
import { Button } from "@components/globals";
import { Dialog, useDialogRef } from "@components/form-builder/app/shared";
import { updateActiveStatus } from "@pages/admin/accounts";
import { useRefresh } from "@lib/hooks";
import Loader from "@components/globals/Loader";
import { Attention, AttentionTypes } from "@components/globals/Attention/Attention";
import * as Alert from "@components/globals/Alert/Alert";
import { DBUser } from "@lib/types/user-types";
import { WarningIcon } from "@components/form-builder/icons";

const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (res.status === 200) {
    const data = await res.json();
    return data;
  }

  // handle using swr error
  throw new Error("Something went wrong");
};

export const ConfirmDeactivateModal = ({
  handleClose,
  user,
}: {
  handleAddType?: (type?: FormElementTypes) => void;
  handleClose: () => void;
  user: DBUser;
}) => {
  const { t } = useTranslation("admin-users");
  const dialog = useDialogRef();
  const { refreshData } = useRefresh();

  const userId = user.id;
  const { data, isLoading, error } = useSWR(`/api/account/${userId}/forms`, fetcher);

  const actions = (
    <>
      {data && data.length == 0 && (
        <Button
          theme="primary"
          onClick={async () => {
            await updateActiveStatus(user.id, !user.active);
            await refreshData();

            dialog.current?.close();
            handleClose();
          }}
        >
          {t("deactivateAccount")}
        </Button>
      )}
      <Button
        className={data && data.length == 0 ? "ml-5" : ""}
        theme="secondary"
        onClick={() => {
          dialog.current?.close();
          handleClose();
        }}
      >
        {t("cancel")}
      </Button>
    </>
  );

  if (isLoading) {
    return (
      <Dialog handleClose={handleClose} dialogRef={dialog}>
        <div className="p-5">
          <Loader message={t("loading", { ns: "form-builder" })} />
        </div>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog handleClose={handleClose} dialogRef={dialog}>
        <div className="flex min-h-[150px] p-5">
          <div className="w-[100%] p-10">
            <Alert.Danger>
              <Alert.Title>{t("formDelete.error")}</Alert.Title>
              <p>{t("somethingWentWrong")}</p>
            </Alert.Danger>
          </div>
        </div>
      </Dialog>
    );
  }

  if (data && data.length > 0) {
    return (
      <Dialog
        handleClose={handleClose}
        dialogRef={dialog}
        title={t("deactivateAccount")}
        actions={actions}
      >
        <Alert.Danger className="mb-4">
          <p>
            <a
              className="!text-red hover:no-underline focus:bg-inherit focus:shadow-none active:bg-inherit active:shadow-none active:outline-offset-0 active:outline-inherit"
              href={`/admin/accounts/${userId}/manage-forms`}
            >
              {t("publishedFormsMustBeTransferred.text1")}
            </a>{" "}
            {t("publishedFormsMustBeTransferred.text2")}
          </p>
        </Alert.Danger>
      </Dialog>
    );
  }

  return (
    <div className="form-builder">
      <Dialog
        title={t("deactivateThisAccount")}
        dialogRef={dialog}
        handleClose={handleClose}
        actions={actions}
        className="max-h-[80%] overflow-y-scroll"
      >
        <div className="my-8">
          <p>{t("deactivatingWillNotifyUser")}</p>
          <p className="mt-5">
            {user.name} <br />
            {user.email}
          </p>
        </div>
      </Dialog>
    </div>
  );
};

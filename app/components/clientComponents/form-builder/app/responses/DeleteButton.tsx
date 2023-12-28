import { Button } from "@clientComponents/globals";
import React from "react";
import { useTranslation } from "@i18n/client";

export const DeleteButton = ({
  setShowConfirmNewDialog,
}: {
  setShowConfirmNewDialog: (showConfirmNewDialog: boolean) => void;
}) => {
  const { t } = useTranslation("form-builder-responses");

  const handleDelete = () => {
    setShowConfirmNewDialog(true);
  };

  return (
    <>
      <Button theme="destructive" onClick={handleDelete}>
        {t("downloadResponsesTable.deleteSelectedResponses")}
      </Button>
    </>
  );
};

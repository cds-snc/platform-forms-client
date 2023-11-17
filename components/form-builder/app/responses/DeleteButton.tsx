import { Button } from "@components/globals";
import React from "react";
import { useTranslation } from "react-i18next";

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

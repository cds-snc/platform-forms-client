import { Button } from "@components/globals";
import React from "react";
import { useTranslation } from "react-i18next";

export const DeleteButton = ({
  setShowConfirmNewDialog,
}: {
  setShowConfirmNewDialog: (showConfirmNewDialog: boolean) => void;
}) => {
  const { t } = useTranslation("form-builder-responses");

  return (
    <>
      <Button theme="destructive" onClick={() => setShowConfirmNewDialog(true)}>
        {t("downloadResponsesTable.deleteSelectedResponses")}
      </Button>
    </>
  );
};

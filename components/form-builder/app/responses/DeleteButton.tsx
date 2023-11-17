import { Button } from "@components/globals";
import React from "react";
import { useTranslation } from "react-i18next";

export const DeleteButton = () => {
  const { t } = useTranslation("form-builder-responses");

  const handleDelete = () => {
    alert("Not yet implemented");
  };

  return (
    <Button theme="destructive" onClick={handleDelete}>
      {t("downloadResponsesTable.deleteSelectedResponses")}
    </Button>
  );
};

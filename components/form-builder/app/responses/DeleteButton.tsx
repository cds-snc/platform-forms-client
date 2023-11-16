import { Button } from "@components/globals";
import React from "react";
import { useTranslation } from "react-i18next";

const handleDelete = () => {
  alert("Not yet implemented");
};

export const DeleteButton = () => {
  const { t } = useTranslation("form-builder-responses");
  return (
    <Button theme="destructive" className="mr-4 inline-block" onClick={handleDelete}>
      {t("downloadResponsesTable.deleteSelectedResponses")}
    </Button>
  );
};

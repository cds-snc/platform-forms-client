import { Button } from "@clientComponents/globals";
import { useRef } from "react";

export const ManageFormAccess = () => {
  const documentRef = useRef<Document | null>(null);

  if (typeof window !== "undefined") {
    documentRef.current = window.document;
  }

  const openManageFormAccessDialog = () => {
    const openDialog = new CustomEvent("open-form-access-dialog");

    documentRef.current?.dispatchEvent(openDialog);
  };

  return (
    <Button
      theme="secondary"
      className="border-1 px-3 py-2 text-sm"
      onClick={openManageFormAccessDialog}
    >
      Manage form access
    </Button>
  );
};

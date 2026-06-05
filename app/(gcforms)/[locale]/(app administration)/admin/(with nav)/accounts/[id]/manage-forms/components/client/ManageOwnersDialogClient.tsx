"use client";
import React from "react";
import { LocalDialog, useLocalDialogRef } from "./LocalDialog";
import { useRouter } from "next/navigation";
import { useCustomEvent } from "@lib/hooks/useCustomEvent";
import { Button } from "@clientComponents/globals";

export default function ManageOwnersDialogClient({ children }: { children: React.ReactNode }) {
  const dialogRef = useLocalDialogRef();
  const router = useRouter();
  const { Event } = useCustomEvent();

  const handleClose = () => {
    const sp = new URLSearchParams(window.location.search);
    sp.delete("manageOwnership");
    const query = sp.toString();
    router.replace(`${window.location.pathname}${query ? `?${query}` : ""}`);
  };

  const actions = (
    <div className="flex gap-4">
      <Button
        theme="primary"
        onClick={() => {
          Event.fire("save-manage-owners");
        }}
      >
        Save
      </Button>
    </div>
  );

  return (
    <LocalDialog
      dialogRef={dialogRef}
      handleClose={handleClose}
      title={"Manage ownership"}
      actions={actions}
      className="max-w-230"
    >
      <div className="mb-10 p-4">{children}</div>
    </LocalDialog>
  );
}

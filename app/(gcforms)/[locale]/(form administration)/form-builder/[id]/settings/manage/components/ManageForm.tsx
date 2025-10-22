"use client";

import { ClosedDetails } from "@lib/types";

import { SetClosingDate } from "../close/SetClosingDate";
import { Notifications } from "../notifications/Notifications";

interface ManageFormProps {
  canSetClosingDate: boolean;
  id: string;
  closedDetails?: ClosedDetails;
}

export const ManageForm = (props: ManageFormProps) => {
  const { canSetClosingDate, id, closedDetails } = props;

  return (
    <>
      {canSetClosingDate && <SetClosingDate formId={id} closedDetails={closedDetails} />}
      <Notifications formId={id} />
    </>
  );
};

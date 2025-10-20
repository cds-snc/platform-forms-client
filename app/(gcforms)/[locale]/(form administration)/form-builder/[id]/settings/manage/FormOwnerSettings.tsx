import { type FormRecord, ClosedDetails } from "@lib/types";

import { SetClosingDate } from "./close/SetClosingDate";
import { Notifications } from "./notifications/Notifications";

interface FormOwnerSettingsProps {
  formRecord?: FormRecord;
  canSetClosingDate: boolean;
  id: string;
  closedDetails?: ClosedDetails;
}

export const FormOwnerSettings = ({
  id,
  canSetClosingDate,
  closedDetails,
}: FormOwnerSettingsProps) => {
  return (
    <>
      {canSetClosingDate && <SetClosingDate formId={id} closedDetails={closedDetails} />}
      <Notifications formId={id} />
    </>
  );
};

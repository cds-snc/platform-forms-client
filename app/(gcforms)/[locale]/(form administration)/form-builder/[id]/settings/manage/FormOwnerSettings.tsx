import { type FormRecord, ClosedDetails } from "@lib/types";

import { DownloadForm } from "./DownloadForm";
import { SetClosingDate } from "./close/SetClosingDate";

import { SetSaveAndResume } from "./saveAndResume/SetSaveAndResume";
import { Notifications } from "./notifications/Notifications";

interface FormOwnerSettingsProps {
  formRecord?: FormRecord;
  canSetClosingDate: boolean;
  id: string;
  closedDetails?: ClosedDetails;
}

export const FormOwnerSettings = ({
  id,
  formRecord,
  canSetClosingDate,
  closedDetails,
}: FormOwnerSettingsProps) => {
  return (
    <>
      {canSetClosingDate && <SetClosingDate formId={id} closedDetails={closedDetails} />}
      <SetSaveAndResume formId={id} />
      <Notifications
        formId={id}
        notificationsInterval={formRecord?.notificationsInterval}
        disabled={formRecord?.deliveryOption !== undefined}
        off={formRecord?.deliveryOption !== undefined}
      />
      <DownloadForm />
    </>
  );
};

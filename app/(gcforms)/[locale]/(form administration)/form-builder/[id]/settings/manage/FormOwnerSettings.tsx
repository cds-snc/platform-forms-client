import { type FormRecord, ClosedDetails } from "@lib/types";

import { DownloadForm } from "./DownloadForm";
import { SetClosingDate } from "./close/SetClosingDate";

import { SetSaveAndResume } from "./saveAndResume/SetSaveAndResume";
import { Notifications } from "./notifications/Notifications";
import { NotificationsInterval } from "@gcforms/types";

interface FormOwnerSettingsProps {
  formRecord?: FormRecord;
  canSetClosingDate: boolean;
  id: string;
  closedDetails?: ClosedDetails;
  notificationsInterval?: NotificationsInterval;
}

export const FormOwnerSettings = ({
  id,
  canSetClosingDate,
  closedDetails,
  notificationsInterval,
}: FormOwnerSettingsProps) => {
  return (
    <>
      {canSetClosingDate && <SetClosingDate formId={id} closedDetails={closedDetails} />}
      <SetSaveAndResume formId={id} />
      <Notifications formId={id} notificationsInterval={notificationsInterval} />
      <DownloadForm />
    </>
  );
};

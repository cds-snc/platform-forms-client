import { type FormRecord, ClosedDetails } from "@lib/types";

import { DownloadForm } from "./DownloadForm";
import { SetClosingDate } from "./close/SetClosingDate";

import { SetSaveAndResume } from "./saveAndResume/SetSaveAndResume";
import { Notifications } from "./notifications/Notifications";
import { logMessage } from "@lib/logger";

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
  formRecord,
}: FormOwnerSettingsProps) => {
  logMessage.info(`~~~~FormOwnerSettings formRecord=${JSON.stringify(formRecord)}`);

  return (
    <>
      {canSetClosingDate && <SetClosingDate formId={id} closedDetails={closedDetails} />}
      <SetSaveAndResume formId={id} />
      <Notifications formId={id} notificationsInterval={formRecord?.notificationsInterval} />
      <DownloadForm />
    </>
  );
};

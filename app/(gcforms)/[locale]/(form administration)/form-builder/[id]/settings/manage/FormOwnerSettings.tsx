import { type FormRecord, ClosedDetails } from "@lib/types";

import { DownloadForm } from "../components/DownloadForm";
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
  canSetClosingDate,
  closedDetails,
}: FormOwnerSettingsProps) => {
  return (
    <>
      {canSetClosingDate && <SetClosingDate formId={id} closedDetails={closedDetails} />}
      <SetSaveAndResume formId={id} />
      <Notifications formId={id} />
      <DownloadForm />
    </>
  );
};
